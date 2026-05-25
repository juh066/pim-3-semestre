namespace AuroraGaleria.Models
{
    public class Exposicao
    {
        public int Id { get; set; }
        public string Titulo { get; set; } = "";
        public string Descricao { get; set; } = "";
        public string ImagemUrl { get; set; } = "";
        public string Data { get; set; } = "";
    }
}