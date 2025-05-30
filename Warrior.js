class Warrior extends Personaje {

    constructor() {
        super();
        this.personaje = document.getElementById("personaje");
    }

    status() {
        return this.personaje.getBoundingClientRect();
    }

    correr() {
        this.clean();
        this.personaje.classList.add("correr"); 
    }

    saltar() {
        if(this.personaje.classList.contains("correr")) {       
            this.clean(); 

            this.personaje.classList.add("saltar");

            // this.personaje.addEventListener("animationend", () => {
            //     this.correr();
            // })
        }
    }

    perderVida() {
        // if(this.personaje.classList.contains("correr")) {
            this.clean();
            this.personaje.classList.add("perder-vida");
    
            this.personaje.addEventListener("animationend", () => {
                this.correr();
            })
        // }
    }

    morir() {
        this.clean();
        this.personaje.classList.add("morir");
    }
    
    clean() {
        this.personaje.classList.remove("correr");
        this.personaje.classList.remove("saltar");
        this.personaje.classList.remove("perder-vida");
        this.personaje.classList.remove("morir");
        this.personaje.removeEventListener("animationend", () => {});
    }
}