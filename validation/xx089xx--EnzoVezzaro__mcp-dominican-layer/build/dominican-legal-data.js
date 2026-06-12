// dominican-legal-data.ts
// Export the legal data
export const dominicanLegalData = {
    legal_system: {
        overview: "The Dominican Republic has a civil law system based on the French Napoleonic Code. The legal system comprises a hierarchy of courts with the Constitutional Court and Supreme Court at the top.",
        court_hierarchy: [
            {
                name: "Constitutional Court (Tribunal Constitucional)",
                jurisdiction: "Constitutional matters, interpretation of the Constitution, review of laws",
                website: "https://www.tribunalconstitucional.gob.do/"
            },
            {
                name: "Supreme Court (Suprema Corte de Justicia)",
                jurisdiction: "Highest court for non-constitutional matters, cassation appeals",
                website: "https://www.poderjudicial.gob.do/"
            },
            {
                name: "Courts of Appeal (Cortes de Apelación)",
                jurisdiction: "Appeals from Courts of First Instance"
            },
            {
                name: "Courts of First Instance (Juzgados de Primera Instancia)",
                jurisdiction: "Original jurisdiction for most civil and criminal matters"
            },
            {
                name: "Peace Courts (Juzgados de Paz)",
                jurisdiction: "Minor civil and criminal matters, traffic violations"
            },
            {
                name: "Specialized Courts",
                jurisdiction: "Labor, land, administrative, children and adolescents"
            }
        ]
    },
    primary_legislation: [
        {
            name: "Constitution of the Dominican Republic",
            description: "Supreme law of the Dominican Republic, last reformed in 2015",
            key_provisions: [
                "Article 6: Supremacy of the Constitution",
                "Article 37-74: Fundamental Rights and Guarantees",
                "Article 76-78: Nationality and Citizenship",
                "Article 149-174: Judicial Power"
            ],
            source: "https://www.dominicana.gob.do/index.php/recursos/2014-12-16-21-02-56/category/3-constitucion-y-leyes-rd"
        },
        {
            name: "Civil Code",
            description: "Governs private relationships between individuals",
            key_provisions: [
                "Articles 1-15: General Provisions",
                "Articles 16-515: Persons",
                "Articles 516-710: Property",
                "Articles 711-1386: Different Ways of Acquiring Property",
                "Articles 1387-2281: Contracts and Obligations"
            ],
            source: "https://www.oas.org/dil/esp/Código%20Civil%20de%20la%20República%20Dominicana.pdf"
        },
        {
            name: "Penal Code",
            description: "Defines crimes and their punishments",
            key_provisions: [
                "Articles 1-74: General Provisions",
                "Articles 75-463: Crimes and Offenses Against Public Interest",
                "Articles 464-486: Crimes and Offenses Against the Constitution"
            ],
            source: "https://www.oas.org/juridico/spanish/mesicic3_rep_cod_penal.pdf"
        },
        {
            name: "Labor Code (Law 16-92)",
            description: "Regulates labor relations and employment",
            key_provisions: [
                "Articles 1-38: General Provisions",
                "Articles 39-83: Employment Contract",
                "Articles 84-95: Contract Termination",
                "Articles 96-190: Rights and Obligations",
                "Articles 191-257: Labor Unions and Collective Bargaining"
            ],
            source: "https://www.mt.gob.do/images/docs/biblioteca/codigo_de_trabajo.pdf"
        },
        {
            name: "Commercial Code",
            description: "Regulates commercial transactions and business entities",
            key_provisions: [
                "Articles 1-109: Merchants and Commercial Acts",
                "Articles 110-189: Commercial Companies",
                "Articles 190-556: Commercial Transactions",
                "Articles 557-648: Checks and Payment Instruments"
            ],
            source: "https://www.poderjudicial.gob.do/documentos/PDF/codigos/Codigo_Comercio.pdf"
        },
        {
            name: "Tax Code (Law 11-92)",
            description: "Establishes tax system and procedures",
            key_provisions: [
                "Title I: General Provisions",
                "Title II: Income Tax",
                "Title III: Tax on Transfers of Industrialized Goods and Services (ITBIS)",
                "Title IV: Selective Consumption Tax"
            ],
            source: "https://dgii.gov.do/legislacion/codigoTributario/Documents/Titulo1.pdf"
        }
    ],
    important_laws: [
        {
            name: "Law 108-05 on Real Estate Registration",
            description: "Governs real estate property registration system",
            key_provisions: [
                "Articles 1-10: General Provisions",
                "Articles 11-26: Real Estate Jurisdiction",
                "Articles 27-51: Registration Process",
                "Articles 52-131: Special Procedures"
            ]
        },
        {
            name: "Law 136-03 (Code for the Protection of Children and Adolescents)",
            description: "Establishes the system of protection for minors' rights",
            key_provisions: [
                "Articles 1-55: Fundamental Rights",
                "Articles 56-108: Family",
                "Articles 223-267: Civil Responsibility",
                "Articles 293-373: Criminal Responsibility"
            ]
        },
        {
            name: "Law 76-02 (Criminal Procedure Code)",
            description: "Establishes criminal procedures and guarantees",
            key_provisions: [
                "Articles 1-28: General Principles",
                "Articles 29-76: Criminal Action",
                "Articles 118-148: The Victim",
                "Articles 266-292: Investigation Process"
            ]
        },
        {
            name: "Law 155-17 against Money Laundering and Terrorist Financing",
            description: "Establishes measures against money laundering",
            key_provisions: [
                "Articles 1-4: General Provisions",
                "Articles 5-9: Prevention Measures",
                "Articles 10-23: Criminal Provisions",
                "Articles 24-34: International Cooperation"
            ]
        },
        {
            name: "Law 141-15 on Restructuring and Liquidation of Companies",
            description: "Modern bankruptcy law",
            key_provisions: [
                "Articles 1-43: General Provisions",
                "Articles 44-129: Restructuring Process",
                "Articles 130-153: Judicial Liquidation"
            ]
        }
    ],
    legal_procedures: {
        civil_procedure: {
            ordinary_process: [
                "Filing a complaint (demanda) with the competent court",
                "Service of process (notificación) to the defendant",
                "Defendant's response (15 days in general)",
                "Preliminary hearing (audiencia preliminar)",
                "Evidence presentation and arguments",
                "Judgment"
            ],
            appeals: [
                "Appeal must be filed within one month of notification of judgment",
                "Appeal is heard by the Court of Appeals",
                "Further appeal (casación) to Supreme Court possible within 30 days"
            ],
            enforcement: [
                "Judgments become enforceable 30 days after notification",
                "Request for enforcement must be filed with the court",
                "Court issues enforcement order"
            ]
        },
        criminal_procedure: {
            investigative_phase: [
                "Complaint or police report",
                "Preliminary investigation by the prosecutor",
                "Formalization of charges (if applicable)",
                "Preliminary hearing to determine if case goes to trial"
            ],
            trial_phase: [
                "Evidence presentation",
                "Witness testimony",
                "Arguments",
                "Verdict and sentencing (if guilty)"
            ],
            appeals: [
                "Appeal must be filed within 10 days",
                "Appeal heard by Court of Appeals",
                "Cassation appeal to Supreme Court possible"
            ]
        },
        labor_procedure: {
            conciliation_phase: [
                "Mandatory conciliation attempt before the Ministry of Labor",
                "If conciliation fails, lawsuit can be filed"
            ],
            judicial_phase: [
                "Filing complaint with Labor Court",
                "Preliminary hearing",
                "Evidence phase",
                "Judgment"
            ],
            appeals: [
                "Appeal to Labor Court of Appeals within one month",
                "Cassation appeal to Supreme Court possible within one month"
            ]
        }
    },
    common_legal_issues: {
        property_disputes: {
            common_problems: [
                "Boundary disputes",
                "Title problems",
                "Adverse possession claims",
                "Real estate fraud"
            ],
            relevant_laws: [
                "Civil Code Articles 544-577",
                "Law 108-05 on Real Estate Registration"
            ],
            jurisdiction: "Land Courts (Tribunales de Tierras)"
        },
        family_matters: {
            common_problems: [
                "Divorce procedures",
                "Child custody",
                "Child support",
                "Domestic violence"
            ],
            relevant_laws: [
                "Civil Code Articles on Family",
                "Law 136-03 (Code for the Protection of Children and Adolescents)",
                "Law 24-97 against Domestic Violence"
            ],
            jurisdiction: "Family Courts (Tribunales de Familia)"
        },
        labor_disputes: {
            common_problems: [
                "Wrongful termination",
                "Severance pay (prestaciones laborales)",
                "Workplace harassment",
                "Workplace injuries"
            ],
            relevant_laws: [
                "Labor Code (Law 16-92)",
                "Social Security Law 87-01"
            ],
            jurisdiction: "Labor Courts (Juzgados de Trabajo)"
        },
        business_issues: {
            common_problems: [
                "Contract disputes",
                "Corporate governance conflicts",
                "Intellectual property matters",
                "Bankruptcy and restructuring"
            ],
            relevant_laws: [
                "Commercial Code",
                "Law 20-00 on Industrial Property",
                "Law 141-15 on Restructuring and Liquidation of Companies"
            ],
            jurisdiction: "Commercial Chambers of Civil and Commercial Courts"
        }
    },
    legal_professions: {
        attorneys: {
            requirements: "Law degree and bar membership (colegiatura) in the Dominican Bar Association (Colegio de Abogados)",
            regulation: "Regulated by Law 91-83 on the Dominican Bar Association"
        },
        notaries: {
            requirements: "Law degree and appointment as notary by the President",
            functions: "Authentication of documents, certifying signatures, preparing legal documents"
        },
        judges: {
            selection: "Selected and appointed by the National Council of the Judiciary (Consejo Nacional de la Magistratura)",
            requirements: "Law degree, minimum years of professional experience, pass examinations"
        }
    },
    important_legal_timeframes: {
        statute_of_limitations: {
            civil_actions: "20 years for real estate actions, 10 years for personal actions",
            labor_claims: "3 months to 1 year depending on the claim type",
            criminal_cases: "Varies by crime severity, from 3 years to 30 years"
        },
        procedural_deadlines: {
            civil_response: "15 days to respond to complaint",
            civil_appeal: "1 month from judgment notification",
            criminal_appeal: "10 days from judgment notification",
            labor_appeal: "1 month from judgment notification"
        }
    }
};
