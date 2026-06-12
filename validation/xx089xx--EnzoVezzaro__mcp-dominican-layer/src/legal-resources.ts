export const legalResources = {
  constitution: [
    "https://www.presidencia.gob.do/constitucion",
    "https://www.dominicana.gob.do/constitucion",
    "https://www.tribunalconstitucional.gob.do/constitucion"
  ],
  civil_code: [
    "https://www.poderjudicial.gob.do/codigos/civil",
    "https://www.oas.org/dil/esp/Codigo_Civil.pdf",
    "https://www.mij.gov.do/codigo-civil"
  ],
  penal_code: [
    "https://www.poderjudicial.gob.do/codigos/penal", 
    "https://www.oas.org/juridico/penal.pdf",
    "https://www.mij.gov.do/codigo-penal"
  ],
  labor_code: [
    "https://www.mt.gob.do/codigo-trabajo",
    "https://www.poderjudicial.gob.do/codigos/laboral"
  ],
  commercial_code: [
    "https://www.poderjudicial.gob.do/codigos/comercio",
    "https://www.dgii.gov.do/comercio/codigo"
  ],
  tax_code: [
    "https://dgii.gov.do/legislacion/codigoTributario/Documents/Titulo1.pdf",
    "https://www.dgii.gov.do/legislacion/Documents/Codigo_Tributario_2023.pdf"
  ]
};


export const legalArticles = {
  constitution: {
    "37": "https://tribunalconstitucional.gob.do/articulo/37",
    "40": "https://tribunalconstitucional.gob.do/articulo/40",
    "44": "https://tribunalconstitucional.gob.do/articulo/44",
    "49": "https://tribunalconstitucional.gob.do/articulo/49",
    "55": "https://tribunalconstitucional.gob.do/articulo/55"
  },
  civil_code: {
    "1101": "https://poderjudicial.gob.do/articulos/civil/1101",
    "1183": "https://poderjudicial.gob.do/articulos/civil/1183",
    "1219": "https://poderjudicial.gob.do/articulos/civil/1219",
    "1245": "https://poderjudicial.gob.do/articulos/civil/1245",
    "1382": "https://poderjudicial.gob.do/articulos/civil/1382",
    "1467": "https://poderjudicial.gob.do/articulos/civil/1467"
  },
  penal_code: {
    "1": "https://poderjudicial.gob.do/articulos/penal/1",
    "265": "https://poderjudicial.gob.do/articulos/penal/265",
    "266": "https://poderjudicial.gob.do/articulos/penal/266",
    "303": "https://poderjudicial.gob.do/articulos/penal/303",
    "304": "https://poderjudicial.gob.do/articulos/penal/304",
    "309": "https://poderjudicial.gob.do/articulos/penal/309"
  }
};

export const legalPrecedents = {
  supreme_court: [
    {
      case: "SCJ-PS-22-0123",
      title: "Contractual Obligations",
      url: "https://poderjudicial.gob.do/sentencias/SCJ-PS-22-0123",
      summary: "Interpretation of contractual terms under Art. 1101 Civil Code",
      year: 2022
    },
    {
      case: "SCJ-CP-21-0456", 
      title: "Property Rights",
      url: "https://poderjudicial.gob.do/sentencias/SCJ-CP-21-0456",
      summary: "Boundary disputes and property rights determination",
      year: 2021
    }
  ],
  constitutional_court: [
    {
      case: "TC-01-2021",
      title: "Digital Privacy",
      url: "https://tribunalconstitucional.gob.do/sentencias/TC-01-2021",
      summary: "Right to privacy in digital communications",
      year: 2021  
    },
    {
      case: "TC-05-2020",
      title: "Freedom of Expression",
      url: "https://tribunalconstitucional.gob.do/sentencias/TC-05-2020",
      summary: "Limits on freedom of expression in media",
      year: 2020
    }
  ]
};
