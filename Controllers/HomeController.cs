using Microsoft.AspNetCore.Mvc;
using AuroraGaleria.Models;

namespace AuroraGaleria.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            var exposicoes = ExposicoesCatalogo.Todas
                .Select(exposicao => new Exposicao
                {
                    Titulo = exposicao.Titulo,
                    Descricao = exposicao.Descricao,
                    ImagemUrl = exposicao.ImagemUrl,
                    Data = exposicao.Periodo
                })
                .ToList();

            return View(exposicoes);
        }
    }
}
