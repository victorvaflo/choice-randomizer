const added = [];
let selected = '';
const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
});
arweave.network.getInfo().then(console.log);

$(document).ready(() => {
    $('#js-add').on('submit', (e) => {
        e.preventDefault();
      const option = $('#option').val();
      console.log(option, added);

      if(option === '') {
        return;
      }
      
      if($.inArray(option, added) !== -1) {
        return alert('option already added');
      }

      added.push(option);

      if(added.length >= 2) {
        $('#js-choose').removeClass('hide');
      }

      const html = `   <div class="col s12">
          <div class="card-panel">
              ${option}
          </div>
      </div>`;

      $('#js-cards').append(html);
    });

    $('#js-choose').on('click', (e) => {
      e.preventDefault();

       selected = added[Math.floor(Math.random() * added.length)];
      console.log(selected);

      $('#js-add').addClass('hide');
      $('#js-choose').addClass('hide');
      $('#js-save').removeClass('hide');

      const html=`  <div class="col s12">
      <h2>your random selection</h2>
          <div class="card-panel blue darken-2 white-text">
              ${selected}
          </div>
      </div>`;

      $('#js-cards').html(html);
    });

    $('#file').on('change', (e) => {
      accounts.login(e);
      $('#file').addClass('hide');
    });

    $('#js-save').on('click', (e) => {
      e.preventDefault();

      const key = accounts.wallet;

      arweave.createTransaction({
          data: selected 
      }, key).then(transaction => {
        transaction.addTag('App-Name', 'choices-randomizer');

        arweave.transactions.sign(transaction, key).then(t => {
          console.log(t);
        });
        
        console.log(transaction);
      });
    
   
    
    });
});



class Accounts {
  constructor() {
      this._data = new Map();
      this._loginOpen = false;
  }

  init() {
      this._events();
  }

  async getUsername(address = this.walletAddress) {
      if(this._data.has(address)) {
          return this._data.get(address);
      }

      let get_name_query =
          {
              op: 'and',
              expr1:
                  {
                      op: 'equals',
                      expr1: 'App-Name',
                      expr2: 'arweave-id'
                  },
              expr2:
                  {
                      op: 'and',
                      expr1:
                          {
                              op: 'equals',
                              expr1: 'from',
                              expr2: address
                          },
                      expr2:
                          {
                              op: 'equals',
                              expr1: 'Type',
                              expr2: 'name'
                          }
                  }
          };

      const txs = await arweave.api.post(`arql`, get_name_query);

      if(txs.data.length === 0)
          return address;

      const tx = await arweave.transactions.get((txs.data)[0]);

      const username = tx.get('data', {decode: true, string: true});

      this._data.set(address, username);

      return username;
  }

  

  login(ev) {
      const fileReader = new FileReader();
      fileReader.onload = async e => {
          this.loggedIn = true;
          this.wallet = JSON.parse(e.target.result);

          const address = await arweave.wallets.jwkToAddress(this.wallet);
          this.walletAddress = address;

          this.walletUser = await this.getUsername(address);

         
          console.log(this.walletUser);
         
          app.hashChanged();

          
      };
      fileReader.readAsText(ev.target.files[0]);
  }

  _containsFiles(event){
      if (event.dataTransfer.types) {
          for (var i=0; i<event.dataTransfer.types.length; i++) {
              if (event.dataTransfer.types[i] == "Files") {
                  return true;
              }
          }
      }

      return false;
  }

  _events() {
      $('#keyfile').on('change', e => {
          this._login(e);
      });

      

      
  }
}
const accounts = new Accounts();
