namespace AuroraGaleria.Models
{
    public static class ExposicoesCatalogo
    {
        public static readonly IReadOnlyList<ExposicaoInfo> Todas = new List<ExposicaoInfo>
        {
            new(
                "Jean-Michel Basquiat",
                "",
                "/images/basquiat.jpeg",
                "15 Maio - 30 Junho",
                new DateTime(2026, 5, 15),
                new DateTime(2026, 6, 30)),
            new(
                "Takashi Murakami",
                "",
                "/images/Takashi.jpeg",
                "01 Julho - 15 Agosto",
                new DateTime(2026, 7, 1),
                new DateTime(2026, 8, 15)),
            new(
                "Banksy",
                "",
                "/images/bansky.jpeg",
                "20 Agosto - 30 Setembro",
                new DateTime(2026, 8, 20),
                new DateTime(2026, 9, 30))
        };

        public static bool DataValida(string titulo, DateTime data)
        {
            var exposicao = Todas.FirstOrDefault(item =>
                string.Equals(item.Titulo, titulo?.Trim(), StringComparison.OrdinalIgnoreCase));

            return exposicao != null && data.Date >= exposicao.Inicio && data.Date <= exposicao.Fim;
        }
    }

    public class ExposicaoInfo
    {
        public ExposicaoInfo(string titulo, string descricao, string imagemUrl, string periodo, DateTime inicio, DateTime fim)
        {
            Titulo = titulo;
            Descricao = descricao;
            ImagemUrl = imagemUrl;
            Periodo = periodo;
            Inicio = inicio;
            Fim = fim;
        }

        public string Titulo { get; }
        public string Descricao { get; }
        public string ImagemUrl { get; }
        public string Periodo { get; }
        public DateTime Inicio { get; }
        public DateTime Fim { get; }
    }
}
