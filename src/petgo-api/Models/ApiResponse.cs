namespace petgo_api.Models
{
    public class ApiResponse<T>
    {
        public T Dados { get; set; }
        public string Messagem { get; set; } = string.Empty;
        public bool Status { get; set; } = true;
    }
}