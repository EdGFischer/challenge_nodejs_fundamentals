import fs from 'node:fs/promises';

const databasePath = new URL('../db.json', import.meta.url);

export class Database {
    #database = {};

    constructor() {
        fs.readFile(databasePath, 'utf8')
            .then(data => {
                this.#database = JSON.parse(data);
            })
            .catch(() => {
                this.#persist();
            });
    }

    #persist() {
        fs.writeFile(databasePath, JSON.stringify(this.#database, null, 2));
    }

    insert(table, data) {
        if (Array.isArray(this.#database[table])) {
            this.#database[table].push(data);
        } else {
            this.#database[table] = [data];
        }

        this.#persist();

        return data;
    }

    select(table, search) {

        let data = this.#database[table] ?? [];
        if (search) {
            data = data.filter(task => {
                return Object.entries(search).some(([key, value]) => {
                    if (!value) return true;

                    return task[key].includes(value);
                });
            });
        }

        return data;
    }

    update(table, idTask, data) {
        const rowIndex = this.#database[table].findIndex(row => row.id === idTask);

        if (rowIndex > -1) {
            const row = this.#database[table][rowIndex];
            this.#database[table][rowIndex] = { idTask, ...row, ...data };
            this.#persist();
        }
    }

    delete(table, idTask) {
        const rowIndex = this.#database[table].findIndex(row => row.id === idTask);

        if (rowIndex > -1) {
            this.#database[table].splice(rowIndex, 1);
            this.#persist();
        }
    }

}