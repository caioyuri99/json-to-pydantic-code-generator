import { generatePydanticCode } from "./modules/pydantic-code-generator.module";
import fs from "fs";

const ex = `{
  "content": [
    {
      "id": 1,
      "sort": {
        "direction": "ASC"
      }
    }
  ],
  "pageable": {
    "sort": {
      "sorted": false
    }
  },
  "sort": {
    "sorted": false
  }
}`;

/*
NOTE: Versão completa do JSON de exemplo
{
  "content": [
    {
      "id": "4241",
      "codRrTema": "1234",
      "codOrgaoJgdr": "CE",
      "descTipoSituacaoTemaStj": "Acórdão Publicado",
      "nomeMinistro": "NANCY ANDRIGHI",
      "nomeMinistroAtual": "NANCY ANDRIGHI",
      "descRrTema": "<p>Definir sobre qual das partes recai o ônus de provar que a pequena propriedade rural é explorada pela família para fins de reconhecimento de sua impenhorabilidade.</p>",
      "descAnotacoesNurer": "<p>Dados parcialmente recuperados via sistema<b><i>Athos</i></b> e Projeto <b><i>Accordes</i></b>.   Afetação na sessão eletrônica iniciada em 6/12/2023 e finalizada em 12/12/2023 (Corte Especial).<br /><br /><b>Vide Controvérsia n. 572/STJ.</b></p>",
      "processos": [
        {
          "indicadorLeadingCase": "true",
          "numRegistro": 2,
          "siglaClasse": "REsp",
          "numeroProcessoClasse": "2080023",
          "uf": "MG"
        },
        {
          "indicadorLeadingCase": "false",
          "numRegistro": "202302035670",
          "siglaClasse": "REsp",
          "numeroProcessoClasse": "2091805",
          "uf": "GO"
        },
        {
          "indicadorLeadingCase": "true",
          "numRegistro": null,
          "siglaClasse": "REsp",
          "numeroProcessoClasse": "2080023",
          "uf": "MG"
        }
      ],
      "descTeseFirmada": "<p>É ônus do executado provar que a pequena propriedade rural é explorada pela família para fins de reconhecimento de sua impenhorabilidade.</p>",
      "situacao": {
        "dataAfetado": [2024, 2, 28],
        "dataAdmitido": null,
        "dataJulgamento": [2024, 11, 6],
        "dtPublicacaoAcordao": [2024, 11, 11],
        "dataTransito": null,
        "dataSobrestado": null,
        "dataRevisado": null,
        "dataConstroversiaCancelada": null,
        "dataConstroversiaPendente": null,
        "dataConstroversiaVinculadaTema": null,
        "dataConstroversiaSobrestada": null,
        "dataConstroversiaAfetacao": null
      },
      "dtTermoInicial": null,
      "correlacao": null,
      "diasCorridos": null,
      "descCriterioBrs": null,
      "qtdSobrestamentos": 0,
      "sort": {
        "sorted": false,
        "unsorted": true,
        "empty": true
      }
    }
  ],
  "pageable": {
    "sort": {
      "sorted": false,
      "unsorted": true,
      "empty": true,
      "direction": "ASC"
    },
    "offset": 0,
    "pageSize": 15,
    "pageNumber": 0,
    "paged": true,
    "unpaged": false
  },
  "last": true,
  "totalElements": 1,
  "totalPages": 1,
  "size": 15,
  "number": 0,
  "sort": {
    "sorted": false,
    "unsorted": true,
    "empty": true
  },
  "first": true,
  "numberOfElements": 1,
  "empty": false
}
*/

try {
  const data = JSON.parse(ex);
  const res = generatePydanticCode(data);
  fs.writeFileSync("ex.py", res, "utf-8");
} catch (e) {
  console.error(e);
}
