namespace petgo_api.Enums
{
    public enum StatusAdocao
    {
        Pendente,    // 0
        EmAnalise,   // 1
        Aprovado,    // 2 - aprovado, aguardando retirada (sem transferência de posse)
        Recusado,    // 3
        Adotado      // 4 - pet fisicamente retirado; posse transferida aqui
    }
}