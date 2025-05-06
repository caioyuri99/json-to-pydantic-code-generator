import { dedent } from "../../../src/modules/pydantic-code-generator/utils/utils.module";
import { generatePydanticCode } from "../../../src/modules/pydantic-code-generator/pydantic-code-generator.module";

describe("generatePydanticCode", () => {
  test("should generate a single class from a simple object", () => {
    const json = { id: 1, name: "Alice" };

    const result = generatePydanticCode(json);

    expect(result).toBe(dedent`
      from pydantic import BaseModel


      class Model(BaseModel):
        id: int
        name: str
    `);
  });

  test("should generate multiple nested classes from an object with nested structures", () => {
    const json = {
      id: 1,
      profile: {
        age: 25,
        address: { city: "New York", zip: "10001" }
      }
    };

    const result = generatePydanticCode(json);

    expect(result).toBe(dedent`
      from pydantic import BaseModel


      class Address(BaseModel):
        city: str
        zip: str


      class Profile(BaseModel):
        age: int
        address: Address


      class Model(BaseModel):
        id: int
        profile: Profile
    `);
  });

  test("should generate a class with List type for array attributes", () => {
    const json = {
      id: 1,
      tags: ["python", "typescript"]
    };

    const result = generatePydanticCode(json);

    expect(result).toBe(dedent`
      from typing import List

      from pydantic import BaseModel


      class Model(BaseModel):
        id: int
        tags: List[str]
    `);
  });

  test("should generate correct types when attributes have mixed types", () => {
    const json = {
      id: 1,
      value: "text",
      optional_field: null
    };

    const result = generatePydanticCode(json);

    expect(result).toBe(dedent`
      from typing import Any

      from pydantic import BaseModel


      class Model(BaseModel):
        id: int
        value: str
        optional_field: Any
    `);
  });

  test("should handle an array of objects as input", () => {
    const json = [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" }
    ];

    const result = generatePydanticCode(json);

    expect(result).toBe(dedent`
      from pydantic import BaseModel


      class Model(BaseModel):
        id: int
        name: str
    `);
  });

  test("should generate a class for an array of objects with nested structures", () => {
    const json = [
      {
        id: 1,
        profile: { age: 25, city: "New York" }
      },
      {
        id: 2,
        profile: { age: 30, city: "Los Angeles" }
      }
    ];

    const result = generatePydanticCode(json);

    expect(result).toBe(dedent`
      from pydantic import BaseModel


      class Profile(BaseModel):
        age: int
        city: str


      class Model(BaseModel):
        id: int
        profile: Profile
    `);
  });

  test("should correctly handle deeply nested lists", () => {
    const json = {
      matrix: [
        [
          [1, 2],
          [3, 4]
        ],
        [
          [5, 6],
          [7, 8]
        ]
      ]
    };

    const result = generatePydanticCode(json);

    expect(result).toBe(dedent`
      from typing import List

      from pydantic import BaseModel


      class Model(BaseModel):
        matrix: List[List[List[int]]]
    `);
  });

  test("should correctly process an object with missing attributes across instances", () => {
    const json = [
      { id: 1, name: "Alice", age: 25 },
      { id: 2, name: "Bob" }
    ];

    const result = generatePydanticCode(json);

    expect(result).toBe(dedent`
      from typing import Optional

      from pydantic import BaseModel


      class Model(BaseModel):
        id: int
        name: str
        age: Optional[int]
    `);
  });

  test("Real example", () => {
    const json = {
      content: [
        {
          id: "4241",
          codRrTema: "1234",
          codOrgaoJgdr: "CE",
          descTipoSituacaoTemaStj: "Acórdão Publicado",
          nomeMinistro: "NANCY ANDRIGHI",
          nomeMinistroAtual: "NANCY ANDRIGHI",
          descRrTema:
            "<p>Definir sobre qual das partes recai o ônus de provar que a pequena propriedade rural é explorada pela família para fins de reconhecimento de sua impenhorabilidade.</p>",
          descAnotacoesNurer:
            "<p>Dados parcialmente recuperados via sistema<b><i>Athos</i></b> e Projeto <b><i>Accordes</i></b>.   Afetação na sessão eletrônica iniciada em 6/12/2023 e finalizada em 12/12/2023 (Corte Especial).<br /><br /><b>Vide Controvérsia n. 572/STJ.</b></p>",
          processos: [
            {
              indicadorLeadingCase: "true",
              numRegistro: 2,
              siglaClasse: "REsp",
              numeroProcessoClasse: "2080023",
              uf: "MG"
            },
            {
              indicadorLeadingCase: "false",
              numRegistro: "202302035670",
              siglaClasse: "REsp",
              numeroProcessoClasse: "2091805",
              uf: "GO"
            },
            {
              indicadorLeadingCase: "true",
              numRegistro: null,
              siglaClasse: "REsp",
              numeroProcessoClasse: "2080023",
              uf: "MG"
            }
          ],
          descTeseFirmada:
            "<p>É ônus do executado provar que a pequena propriedade rural é explorada pela família para fins de reconhecimento de sua impenhorabilidade.</p>",
          situacao: {
            dataAfetado: [2024, 2, 28],
            dataAdmitido: null,
            dataJulgamento: [2024, 11, 6],
            dtPublicacaoAcordao: [2024, 11, 11],
            dataTransito: null,
            dataSobrestado: null,
            dataRevisado: null,
            dataConstroversiaCancelada: null,
            dataConstroversiaPendente: null,
            dataConstroversiaVinculadaTema: null,
            dataConstroversiaSobrestada: null,
            dataConstroversiaAfetacao: null
          },
          dtTermoInicial: null,
          correlacao: null,
          diasCorridos: null,
          descCriterioBrs: null,
          qtdSobrestamentos: 0,
          sort: {
            sorted: false,
            unsorted: true,
            empty: true
          }
        }
      ],
      pageable: {
        sort: {
          sorted: false,
          unsorted: true,
          empty: true,
          direction: "ASC"
        },
        offset: 0,
        pageSize: 15,
        pageNumber: 0,
        paged: true,
        unpaged: false
      },
      last: true,
      totalElements: 1,
      totalPages: 1,
      size: 15,
      number: 0,
      sort: {
        sorted: false,
        unsorted: true,
        empty: true
      },
      first: true,
      numberOfElements: 1,
      empty: false
    };

    const result = generatePydanticCode(json);

    expect(result).toBe(dedent`
      from typing import Any, List, Optional, Union

      from pydantic import BaseModel


      class ProcessosItem(BaseModel):
        indicadorLeadingCase: str
        numRegistro: Optional[Union[int, str]]
        siglaClasse: str
        numeroProcessoClasse: str
        uf: str


      class Situacao(BaseModel):
        dataAfetado: List[int]
        dataAdmitido: Any
        dataJulgamento: List[int]
        dtPublicacaoAcordao: List[int]
        dataTransito: Any
        dataSobrestado: Any
        dataRevisado: Any
        dataConstroversiaCancelada: Any
        dataConstroversiaPendente: Any
        dataConstroversiaVinculadaTema: Any
        dataConstroversiaSobrestada: Any
        dataConstroversiaAfetacao: Any


      class Sort(BaseModel):
        sorted: bool
        unsorted: bool
        empty: bool


      class ContentItem(BaseModel):
        id: str
        codRrTema: str
        codOrgaoJgdr: str
        descTipoSituacaoTemaStj: str
        nomeMinistro: str
        nomeMinistroAtual: str
        descRrTema: str
        descAnotacoesNurer: str
        processos: List[ProcessosItem]
        descTeseFirmada: str
        situacao: Situacao
        dtTermoInicial: Any
        correlacao: Any
        diasCorridos: Any
        descCriterioBrs: Any
        qtdSobrestamentos: int
        sort: Sort


      class Sort1(BaseModel):
        sorted: bool
        unsorted: bool
        empty: bool
        direction: str


      class Pageable(BaseModel):
        sort: Sort1
        offset: int
        pageSize: int
        pageNumber: int
        paged: bool
        unpaged: bool


      class Sort2(BaseModel):
        sorted: bool
        unsorted: bool
        empty: bool


      class Model(BaseModel):
        content: List[ContentItem]
        pageable: Pageable
        last: bool
        totalElements: int
        totalPages: int
        size: int
        number: int
        sort: Sort2
        first: bool
        numberOfElements: int
        empty: bool
    `);
  });
});
