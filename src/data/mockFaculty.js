export const mockFaculty = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    title: "Associate Professor of Computer Science",
    specialization: "Artificial Intelligence",
    email: "sarah.johnson@email.edu",
    phone: "(555) 123-4567",
    location: "New York, NY",
    currentInstitution: "Tech University",
    skills: ["Machine Learning", "Neural Networks", "Python", "TensorFlow", "Research", "Teaching"],
    appliedDate: "Mar 4, 2025",
    status: "new",
    appliedJobs: [1, 9],
    profileImage: null, 
    summary: "Computer Science Professor with 8+ years of experience in AI research and teaching. My work focuses on developing transparent and explainable AI systems that can be understood and trusted by users. I have published over 30 papers in top-tier conferences and journals, and I have secured over $2M in research funding.",
    education: [
      {
        degree: "Ph.D. in Computer Science",
        institution: "Stanford University",
        year: "2017",
        field: "Artificial Intelligence"
      },
      {
        degree: "M.S. in Computer Science",
        institution: "MIT",
        year: "2014",
        field: "Machine Learning"
      },
      {
        degree: "B.S. in Computer Science",
        institution: "University of Michigan",
        year: "2012",
        field: "Computer Science"
      }
    ],
    experience: [
      {
        title: "Associate Professor",
        institution: "Tech University",
        start: "2021",
        end: "Present",
        description: "Teaching graduate and undergraduate courses in AI and machine learning. Leading a research lab focused on explainable AI and human-AI interaction. Secured $1.2M in funding from NSF and industry partners."
      },
      {
        title: "Assistant Professor",
        institution: "State University",
        start: "2017",
        end: "2021",
        description: "Established a new research program in AI ethics and transparency. Developed and taught 4 new courses in AI and programming. Mentored 12 graduate students and 30+ undergraduates."
      },
      {
        title: "Research Intern",
        institution: "Google AI",
        start: "Summer 2016",
        end: "Fall 2016",
        description: "Worked on developing interpretable deep learning models for natural language processing applications."
      }
    ],
    publications: "Johnson, S., & Smith, J. (2023). Explainable AI for Healthcare Applications. Journal of AI in Medicine, 42(3), 78-92.\n\nJohnson, S., et al. (2022). A Framework for Transparent Machine Learning. Proceedings of the International Conference on Machine Learning (ICML 2022).\n\nJohnson, S. (2021). Teaching AI Ethics to Computer Science Students: Challenges and Opportunities. Journal of Computing Education, 15(2), 45-58.",
    introVideo: 'assets/sample-intro.mp4' 
  },
  {
    id: 2,
    name: "Dr. Michael Rodriguez",
    title: "Professor of Biology",
    specialization: "Molecular Biology",
    email: "m.rodriguez@email.edu",
    phone: "(555) 987-6543",
    location: "Boston, MA",
    currentInstitution: "Eastern University",
    skills: ["Molecular Biology", "Genetics", "CRISPR", "Cell Culture", "Grant Writing", "Research"],
    appliedDate: "Mar 3, 2025",
    status: "reviewed",
    appliedJobs: [6],
    profileImage: null,
    summary: "Molecular biologist with 15 years of research and teaching experience, specializing in gene editing technologies and their applications in disease treatment. My laboratory has pioneered innovative approaches to CRISPR-based therapies for genetic disorders.",
    education: [
      {
        degree: "Ph.D. in Molecular Biology",
        institution: "Harvard University",
        year: "2010",
        field: "Genetics"
      },
      {
        degree: "M.S. in Biology",
        institution: "UCLA",
        year: "2007",
        field: "Cell Biology"
      },
      {
        degree: "B.S. in Biology",
        institution: "University of Texas",
        year: "2005",
        field: "Biology"
      }
    ],
    experience: [
      {
        title: "Professor",
        institution: "Eastern University",
        start: "2018",
        end: "Present",
        description: "Leading a research team of 10 researchers focusing on CRISPR applications in human disease treatment. Teaching advanced genetics and molecular biology courses. Secured $3.5M in NIH funding."
      },
      {
        title: "Associate Professor",
        institution: "Midwest University",
        start: "2013",
        end: "2018",
        description: "Established a new molecular biology laboratory. Developed innovative teaching methods for undergraduate biology education. Mentored 8 Ph.D. students to completion."
      },
      {
        title: "Postdoctoral Researcher",
        institution: "Genome Institute",
        start: "2010",
        end: "2013",
        description: "Conducted research on early applications of CRISPR-Cas9 technology in mammalian cells."
      }
    ],
    publications: "Rodriguez, M., et al. (2024). CRISPR-Based Therapeutic Approaches for Duchenne Muscular Dystrophy. Nature Biotechnology, 42(1), 23-35.\n\nRodriguez, M., & Johnson, K. (2022). Advances in Gene Editing Safety Protocols. Science, 375(6584), 897-901.\n\nRodriguez, M. (2020). Undergraduate Laboratory Techniques in Molecular Biology: A Comprehensive Guide. Journal of Biology Education, 54(3), 112-125.",
    introVideo: null
  },
  {
    id: 3,
    name: "Dr. Priya Patel",
    title: "Assistant Professor of Data Science",
    specialization: "Big Data Analytics",
    email: "priya.patel@email.edu",
    phone: "(555) 456-7890",
    location: "San Francisco, CA",
    currentInstitution: "Bay Area College",
    skills: ["Data Mining", "Statistical Analysis", "Python", "R", "SQL", "Machine Learning", "Big Data"],
    appliedDate: "Mar 2, 2025",
    status: "interviewing",
    appliedJobs: [2, 9],
    profileImage: null,
    summary: "Data scientist and educator with extensive experience in industry and academia. My research focuses on developing scalable algorithms for analyzing massive datasets, with applications in healthcare, finance, and social media.",
    education: [
      {
        degree: "Ph.D. in Statistics",
        institution: "UC Berkeley",
        year: "2019",
        field: "Data Science"
      },
      {
        degree: "M.S. in Computer Science",
        institution: "University of Washington",
        year: "2015",
        field: "Database Systems"
      },
      {
        degree: "B.Tech in Computer Science",
        institution: "Indian Institute of Technology",
        year: "2013",
        field: "Computer Science"
      }
    ],
    experience: [
      {
        title: "Assistant Professor",
        institution: "Bay Area College",
        start: "2021",
        end: "Present",
        description: "Teaching undergraduate and graduate courses in data science and machine learning. Leading research in scalable data analysis methods for healthcare applications."
      },
      {
        title: "Data Scientist",
        institution: "TechCorp Inc.",
        start: "2019",
        end: "2021",
        description: "Led a team developing predictive analytics solutions for financial services. Implemented machine learning pipelines that increased prediction accuracy by 27%."
      },
      {
        title: "Graduate Researcher",
        institution: "UC Berkeley",
        start: "2015",
        end: "2019",
        description: "Conducted research on distributed algorithms for big data analysis. Published 5 papers in top-tier conferences."
      }
    ],
    publications: "Patel, P., & Wang, Y. (2023). Distributed Learning Algorithms for Healthcare Data. Big Data Journal, 11(2), 45-58.\n\nPatel, P., et al. (2022). Scalable Analysis of Clinical Records: A Case Study. Proceedings of the International Conference on Data Mining.\n\nPatel, P. (2020). Teaching Data Science: Bridging Theory and Practice. Journal of Computing Education, 14(3), 78-89.",
    introVideo: null
  }
];