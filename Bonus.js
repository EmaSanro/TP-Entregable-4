class Bonus {
    
    constructor() {
        this.bonus = document.createElement('div');
        this.bonus.classList.add('bonus');
        document.getElementById('contenedor').appendChild(this.bonus);
    }

    status() {
        return this.bonus.getBoundingClientRect();
    }
}