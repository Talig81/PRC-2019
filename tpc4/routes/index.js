var express = require('express');
var router = express.Router();
var axios = require('axios')

var prefixes = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX noInferences: <http://www.ontotext.com/explicit>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX : <http://prc.di.uminho.pt/2020/amd#>
`;

/* GET home page. */

router.get('/', function (req, res, next) {
  var query = `select ?tit (count(?part) as ?numPartituras) ?id where {
    ?id a :Obra .
    ?id :temPartitura ?part .
    ?id :título ?tit
} 
group by ?tit ?id
order by ?tit`;

  var encoding = encodeURIComponent(prefixes + query);
  axios
    .get("http://localhost:7200/repositories/amd" + "?query=" + encoding)
    .then(dados => {
      var lista = dados.data.results.bindings.map(obra => {
        return {
          id: obra.id.value.split("#")[1],
          tit: obra.tit.value,
          nparts: obra.numPartituras.value
        };
      });
      res.render("index", { list: lista });
    })
    .catch(err => {
      res.render("error", { error: err });
    });
});

router.get('/obra/:id', function(req, res){
  var id = req.params.id;
  var query = `select distinct ?tit ?nome ?inst ?voz ?path where{
    :id :título ?tit.
    :id :tipo ?tipo.
    :id :temPartitura ?p.
    :id :éCompostaPor/:nome ?nome.
    ?p :éTocadaPor/:designação ?inst.
    ?p :path ?path.
    OPTIONAL{?p :voz ?voz}
}`;

var query2 = `select ?p ?voz ?clave ?af ?path where { 
  ?p a :Partitura.
  :id :temPartitura ?p .
  ?p :path ?path .
  optional {
    ?p :voz ?voz .    
  }
  optional {
    ?p :clave ?clave .
  }
  optional {
    ?p :afinação ?af .
  }
}`;

var encoding = encodeURIComponent(prefixes + query);
var encoding2 = encodeURIComponent(prefixes + query2);
axios
  .get("http://localhost:7200/repositories/amd" + "?query=" + encoding)
  .then(dados => {
    var obj = {};
    obj["tit"] = dados.data.results.bindings[0].tit.value;
    obj["id"] = dados.data.results.bindings[0].id.value;
    obj["type"] = dados.data.results.bindings[0].type.value;
    obj["compositor"] = dados.data.results.bindings[0].nome.value;
    obj["instrumentos"] = dados.data.results.bindings.map(obra => {
      return {
        nome: obra.inst.value,
        voz: obra.voz ? obra.voz.value : "",
        path: obra.path.value
      };
    });
    res.render("obra", { obra: obj, parts: partituras });
  })
  .catch(erro => {
    res.render("error", { error: erro });
  });
});

module.exports = router;
