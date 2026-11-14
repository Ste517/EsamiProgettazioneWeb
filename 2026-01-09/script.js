class Prenotazione {
    /**
     * 
     * @param {string} nome 
     * @param {string} cognome 
     * @param {string} fasciaOraria 
     */
    constructor(nome, cognome, fasciaOraria) {
        if (typeof(nome) != 'string') {
            throw new Error('nome must be of type string');
        }
        if (typeof(cognome) != 'string') {
            throw new Error('cognome must be of type string');
        }
        if (typeof(fasciaOraria) != 'string') {
            throw new Error('fasciaOraria must be of type string');
        }
        this.nome = nome;
        this.cognome = cognome;
        this.fasciaOraria = fasciaOraria;
    }

    /**
     * @returns {HTMLTableRowElement}
     */
    asTableRow() {
        const tableRow = document.createElement('tr');
        for (key of ['nome','cognome','fasciaOraria']) {
            const tableElem = document.createElement('td');
            tableElem.innerText = this[key];
            tableRow.appendChild(tableElem);
        }
        return tableRow;
    }
}

class Postazione {
    constructor() {
        this.prenotazioni = [];
    }

    addPrenotazione(prenotazione) {
        if (!(prenotazione instanceof Prenotazione)) {
            throw new Error('prenotazione must be a valid Prenotazione object');
        }
        if ((this.prenotazioni.find((obj) => {
            obj.fasciaOraria === prenotazione.fasciaOraria;
        })) === undefined) {
            return false;
        }
        else {
            this.prenotazioni.push(prenotazione);
        }
    }
}