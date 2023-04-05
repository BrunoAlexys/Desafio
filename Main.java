public class Main {
    public static void main(String[] args) {
        No<Pessoa> no1 = new No<>(null,new Pessoa("Amanda"));
        No<Pessoa> no2 = new No<>(null,new Pessoa("Bruno"));
        No<Pessoa> no3 = new No<>(null,new Pessoa("Caio"));
        No<Pessoa> no4 = new No<>(null,new Pessoa("Danilo"));
        No<Pessoa> no5 = new No<>(null,new Pessoa("Eliane"));

        no3.direita = no1;
        no1.direita = no2;
        no2.direita = no4;
        no4.direita = no5;

        recursivo(no3);
    }

    public static void recursivo(No no){
        if (no == null){
            return;
        }else {
            System.out.println(no.elemento.toString());
            recursivo(no.direita);
        }
    }
}
