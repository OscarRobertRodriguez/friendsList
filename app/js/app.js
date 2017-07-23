(function() {




    var db;
    var deleteBtns = document.getElementsByClassName('delete_X');
    // begin Database

    if ('indexedDB' in window) {
        var openRequest = window.indexedDB.open('testDB', 1);

        openRequest.onerror = function(event) {
            console.log('Error' + event.taget.errorCode);
        }

        // create an object store
        openRequest.onupgradeneeded = function(event) {
            console.log('upgrading');
            var db = event.target.result;

            if (!db.objectStoreNames.contains('friends')) {
                console.log('creating friends objectStore');
                var objectStore = db.createObjectStore('friends', {
                    autoIncrement: true
                });
                objectStore.createIndex('email', 'email', {
                    unique: true
                });
                objectStore.createIndex('id', 'id', {
                    unique: true
                });
            }


            objectStore.transaction.oncomplete = function(event) {
                // start a new transaction
                var objectStore = db.transaction('friends', 'readwrite').objectStore('friends');
                var friends = [{
                    id: 1,
                    email: 'bob@bob.com',
                    name: 'Bob',
                    phone: 5126806168
                }, {
                    id: 2,
                    email: 'dan@dan.com',
                    name: 'Dan',
                    phone: 5123456789
                }, {
                    id: 3,
                    email: 'sarah@gmail.com',
                    name: 'Sarah',
                    phone: 5123454589
                }, {
                    id: 4,
                    email: 'oscar@gmail.com',
                    name: 'Oscar',
                    phone: 512234589
                }, {
                    id: 5,
                    email: 'johnny@gmail.com',
                    name: 'Johnny',
                    phone: 5123454512
                }]; // mock data



                friends.forEach(function(friend) {
                    console.log('added friend');
                    objectStore.put(friend);
                });


                // run function to populate list for the first time will not run a second time due to being a part of the upgradeneeded callback which only fires on first database init in this senario 

            }; // end transaction
        }; // onupgrade close


        openRequest.onsuccess = function(e) {
            db = e.target.result;
            var store = openRequest.result.transaction('friends', 'readonly').objectStore('friends');

            var person = store.getAll();

            person.onsuccess = function(e) {
                var data = person.result;

                return createListItem(data);
            }

   
               



            var list = document.querySelector('.list');

             // listen for delete clicks
            list.addEventListener('click', deleteItem, false);

             // listen for delete clicks
            list.addEventListener('click', openEditBox, false);

             // listen for delete clicks
            list.addEventListener('click', editItem, false);

             // listen for delete clicks
            list.addEventListener('click', closeModal);

            


        }



    } // if indexeddb close 


    // functions
    // 
    // 



    function editItem(e) {
        var updateBtn = e.target;
        var version = 2;

        if (e.target.getAttribute('class') === 'updateInfo') {
            e.preventDefault();
            var form = e.target.parentNode;
            var name = form.firstChild.firstChild.nextSibling.value.trim();
            var email = form.firstChild.nextSibling.firstChild.nextSibling.value.trim();
            var phone = form.firstChild.nextSibling.nextSibling.firstChild.nextSibling.value.trim();
            var key = +form.parentNode.parentNode.previousSibling.getAttribute('data-key');

            if (name == '' && email == '' && phone == '') {
                console.log('nothing updated');
            }

            if (name !== '' || email !== '' || phone !== '') {
                console.log('something was updated');


                    var store = db.transaction('friends', 'readwrite').objectStore('friends');

                    var person = store.get(key);

                    person.onsuccess = function(e) {
                        var data = person.result;
                        if (name !== '') {
                            data.name = name;
                        }
                        if (phone !== '') {
                            data.phone = phone;
                        }
                        if (email !== '') {
                            data.email = email;
                        }
                   var newPerson =  store.put(data, key);

                     newPerson.onsuccess = function () {
                     	 var result = newPerson.result;
                     	var store = db.transaction('friends', 'readonly').objectStore('friends'); 
                     	var people = store.getAll(); 
                         
                         people.onsuccess = function () {
                         	var result = people.result; 
                             console.log('info updated');
                         	createListItem(result);
                         	messageHowManyFriends(); 
                         }
                     	
                     }
                    }
                   
              
            } 

         
        }

    };


    function messageHowManyFriends () {
      var list = document.querySelector('.list');
      list.children.length === 0 ? console.log('You need some friends delete the indexedDB database') : ''; 
  
    }; 

    function closeModal(e) {
      	var modal = document.getElementById('myModal');
      	var modals = document.getElementsByClassName('modal');
         var value = e.target.getAttribute('class'); 
       	if( value === 'modal' || value === 'close') {
       		[].forEach.call(modals, function (item) {
       			item.style.display = 'none'; 
       		})
       		
           console.log('edit box closed');
       	}

        

    };



    function openEditBox(e) {
        if (e.target.getAttribute('class') === 'edit_text') {
            var click = e.target;
            var name = click.parentNode.previousSibling.previousSibling.previousSibling.firstChild.nextSibling.textContent,
                modal = click.parentNode.parentNode.nextSibling;

            modal.style.display = 'block';
            console.log("Editor for " + name + ' opened');

        }
    };



    function deleteItem(e) {
        if (e.target.getAttribute('class') === 'delete_X') {
            var clicked = e.target,
                list = clicked.parentNode.parentNode,
                email = clicked.parentNode.nextSibling.nextSibling.firstChild.nextSibling.textContent,
                name = clicked.parentNode.nextSibling.firstChild.nextSibling.textContent,
                store = db.transaction('friends', 'readwrite').objectStore('friends'),
                index = store.index('email');

            var request = index.openCursor(IDBKeyRange.only(email.toString()));

            console.log('Deleted ' + name);
            // delete list item from html 
            list.parentNode.removeChild(list);

            request.onsuccess = function() {
                var cursor = request.result;

                if (cursor) {
                    cursor.delete();
                    cursor.continue();
                }
               
            };

            request.onerror = function() {
                console.log('error', request.result.errorCode);
                console.log('failed to delete ' + name);
            }


        };
    }; // end deleteItem function




    function createListItem(listItem) {
        var list = document.querySelector('.list');
        list.innerHTML = '';
        var buf = [],
            i = 0;
        for (var x = 1; x <= listItem.length; x++) {
            buf[i++] = '<div class="twelve columns list-item" data-key="' + listItem[x - 1].id + '">';
            buf[i++] = '<div class="delete">';
            buf[i++] = '<a class="delete_X">X</a>';
            buf[i++] = '</div>';
            buf[i++] = '<h5>Name:<span class="list-info">' + listItem[x - 1].name + '</span></h5>';
            buf[i++] = '<h5>Email:<span class="list-info">' + listItem[x - 1].email + '</span></h5>';
            buf[i++] = '<h5>Phone:<span class="list-info phone-marker">' + listItem[x - 1].phone + '</span></h5>';
            buf[i++] = '<div class="edit">';
            buf[i++] = '<a class="edit_text">edit</a>';
            buf[i++] = '</div>';
            buf[i++] = '</div>';
            buf[i++] = '<div id="myModal" class="modal">';
            buf[i++] = '<div class="modal-content">';
            buf[i++] = '<span class="close">&times;</span>'
            buf[i++] = '<h1>Edit Info</h1>';
            buf[i++] = '<form class="edit-form">'
            buf[i++] = '<label class="formLabel">Name:<input class="formInput"></label>';
            buf[i++] = '<label class="formLabel">Email:<input class="formInput"></label>';
            buf[i++] = '<label class="formLabel">Phone:<input class="formInput"></label>';
            buf[i++] = '<button type="submit" class="updateInfo">Update</button>';
            buf[i++] = '</form>';
            buf[i++] = '</div>';
            buf[i++] = '</div>';
        }
        list.innerHTML += buf.join('');
       messageHowManyFriends();
    }



}());



