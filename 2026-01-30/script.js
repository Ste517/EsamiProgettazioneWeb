class Nota {
    /**
     * 
     * @param {string} titolo 
     * @param {string} contenuto 
     */
    constructor(titolo,contenuto) {
        this.creationDate = new Date();

        this.titolo = titolo;
        this.contenuto = contenuto;
    }

    asCardElement(modifyCallback = null, deleteCallback = null) {
        const newCard = document.createElement('div');
        newCard.classList.add('card');
        const title = document.createElement('h2');
        title.innerText = this.titolo;
        const contenuto = document.createElement('p');
        contenuto.innerText = this.contenuto;
        const info = document.createElement('div');
        info.classList.add('flex-row');
        info.innerText = 'Creata: ' + this.creationDate.toLocaleString();
        const editButton = document.createElement('button');
        editButton.innerText = 'Modifica';
        editButton.onclick = modifyCallback;
        const deleteButton = document.createElement('button');
        deleteButton.innerText = 'Elimina';
        deleteButton.onclick = deleteCallback;
        info.appendChild(editButton);
        info.appendChild(deleteButton);
        newCard.appendChild(title);
        newCard.appendChild(contenuto);
        newCard.appendChild(info);
    }
}

class Sistema {
    /**
     * 
     * @param {HTMLFormElement} form 
     * @param {HTMLInputElement} searchBar 
     * @param {HTMLDivElement} searchResultsContainer 
     */
    constructor(form, searchBar, searchResultsContainer) {
        /** @type {Nota[]} */
        this.note = [];
        this.notaAttuale = null;
        
        form.addEventListener('submit', (ev) => {
            ev.preventDefault();

            if (this.notaAttuale === null) {
                this.notaAttuale = new Nota(form.elements['titolo'].value,form.elements['contenuto'].value);
                this.note.push(this.notaAttuale);
            } else {
                this.notaAttuale.titolo = form.elements['titolo'].value;
                this.notaAttuale.contenuto = form.elements['contenuto'].value;
            }
        });

        form.addEventListener('reset', () => {
            this.notaAttuale = null;
        });

        searchBar.addEventListener('input', () => {
            searchResultsContainer.innerHTML = '';

            let corrispondenzaNote = [];
            const searchParam = searchBar.value;
            this.note.forEach((nota) => {
                if (nota.titolo.includes(searchParam)) corrispondenzaNote.push(nota);
                if (nota.contenuto.includes(searchParam)) corrispondenzaNote.push(nota);
            });

            const noNoteFoundElem = document.querySelector('section:nth-child(2) p');
            if (corrispondenzaNote.length === 0) {
                noNoteFoundElem.classList.remove('hidden');
                searchResultsContainer.classList.add('hidden');
            } else {
                noNoteFoundElem.classList.add('hidden');
                corrispondenzaNote.forEach(element => {
                    searchResultsContainer.appendChild(element.asCardElement(
                        () => {
                            this.notaAttuale = element;
                            form.elements['titolo'].value = element.titolo;
                            form.elements['contenuto'].value = element.contenuto;
                        },
                        () => {
                            const indexOfElem = this.note.indexOf(element);
                            if (indexOfElem != -1) {
                                this.note.splice(indexOfElem,1);
                            }
                        }
                    ));
                });
            }
        });
    }

    saveToLocalStorage() {

    }

    loadFromLocalStorage() {

    }
}

let sistema = new Sistema(
    document.querySelector('form'),
    document.getElementById('searchBar'),
    document.querySelector('.search-results')
);