using Microsoft.AspNetCore.Mvc;
using AuroraGaleria.Models;

namespace AuroraGaleria.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            var exposicoes = new List<Exposicao>
            {
                new Exposicao
                {
                    Titulo = "Arte Contemporânea",
                    Descricao = "Uma experiência visual moderna.",
                    ImagemUrl = "/images/expo1.jpg",
                    Data = "15 Maio - 30 Junho"
                },
                new Exposicao
                {
                    Titulo = "Modernismo Brasileiro",
                    Descricao = "Grandes artistas brasileiros.",
                    ImagemUrl = "/images/expo2.jpg",
                    Data = "01 Julho - 15 Agosto"
                },
                new Exposicao
                {
                    Titulo = "Fotografia Urbana",
                    Descricao = "A cidade através da arte.",
                    ImagemUrl = "/images/expo3.jpg",
                    Data = "20 Agosto - 30 Setembro"
                }
            };

            return View(exposicoes);
        }
    }
}
