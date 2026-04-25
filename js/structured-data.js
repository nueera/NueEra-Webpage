/**
 * NueEra JSON-LD Structured Data
 * Dynamically injects schema.org structured data based on the current page.
 * Wrapped in IIFE to avoid polluting global scope.
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /*  Shared constants                                                    */
  /* ------------------------------------------------------------------ */
  const SITE_URL = 'https://nueera.io';
  const LOGO     = SITE_URL + '/assets/images/lightlogo.png';
  const OG_IMAGE = SITE_URL + '/assets/images/og-image.png';

  const ORG_SCHEMA = {
    '@type': 'Organization',
    name: 'NueEra',
    url: SITE_URL,
    logo: LOGO,
    description: 'Premium IT & Digital Solutions for ambitious businesses.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Kothrud',
      addressRegion: 'Pune',
      addressCountry: 'IN'
    },
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'hello@nueera.io',
      contactType: 'customer service'
    },
    sameAs: [
      'https://www.facebook.com/nueera',
      'https://www.instagram.com/nueera',
      'https://www.linkedin.com/company/nueera'
    ]
  };

  /* ------------------------------------------------------------------ */
  /*  Helpers                                                             */
  /* ------------------------------------------------------------------ */
  function inject(data) {
    var script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }

  function currentPage() {
    var path = window.location.pathname;
    // Normalise: strip trailing slash, get filename
    var file = path.replace(/\/$/, '').split('/').pop() || 'index.html';
    // Treat bare domain or index references as index.html
    if (file === '' || file === 'index.html' || file === 'index') return 'index';
    return file.replace('.html', '');
  }

  /* ------------------------------------------------------------------ */
  /*  Page-specific schema generators                                     */
  /* ------------------------------------------------------------------ */

  /** index.html  —  Organization + WebSite + SearchAction */
  function schemaIndex() {
    inject({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'NueEra',
      url: SITE_URL,
      description: 'NueEra - A New Era of Digital Growth. Premium IT & Digital Solutions for ambitious businesses.',
      publisher: ORG_SCHEMA,
      potentialAction: {
        '@type': 'SearchAction',
        target: SITE_URL + '/blog.html?q={search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    });

    // Full Organization schema (complements the basic one already in HTML)
    inject({
      '@context': 'https://schema.org',
      '@graph': [
        Object.assign({ '@id': SITE_URL + '#organization' }, ORG_SCHEMA),
        {
          '@type': 'WebPage',
          '@id': SITE_URL + '#webpage',
          url: SITE_URL,
          name: 'NueEra - A New Era of Digital Growth',
          isPartOf: { '@id': SITE_URL + '#website' },
          about: { '@id': SITE_URL + '#organization' },
          description: 'Premium IT & Digital Solutions for ambitious businesses. Web development, apps, marketing, and design.'
        }
      ]
    });
  }

  /** about.html  —  Organization (enhanced) */
  function schemaAbout() {
    inject({
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: 'About Us | NueEra - Our Vision & Mission',
      url: SITE_URL + '/about.html',
      description: 'About NueEra - Our vision, mission, and values for digital transformation.',
      mainEntity: ORG_SCHEMA,
      publisher: ORG_SCHEMA
    });
  }

  /** services.html  —  Service with OfferCatalog */
  function schemaServices() {
    inject({
      '@context': 'https://schema.org',
      '@type': 'Service',
      serviceType: 'Digital Agency Services',
      name: 'NueEra Digital Services',
      description: 'Integrated digital services built for scalable growth — product engineering, automation, marketing, design, and brand strategy.',
      provider: ORG_SCHEMA,
      areaServed: {
        '@type': 'Place',
        name: 'Worldwide'
      },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'NueEra Service Catalog',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Digital Product Development',
              description: 'Scalable web and mobile ecosystems built to convert users, drive engagement, and support business growth.',
              url: SITE_URL + '/services.html#product'
            }
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Business Automation',
              description: 'Smart systems that automate workflows, improve efficiency, and help businesses scale faster.',
              url: SITE_URL + '/services.html#automation'
            }
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Digital Marketing',
              description: 'Growth strategies designed to drive measurable traffic, leads, and revenue.',
              url: SITE_URL + '/services.html#marketing'
            }
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'UI/UX Design',
              description: 'User-centered design systems that combine aesthetics, usability, and conversion optimization.',
              url: SITE_URL + '/services.html#design'
            }
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Branding & Strategy',
              description: 'Strategic brand development that builds recognition, trust, and long-term growth.',
              url: SITE_URL + '/services.html#branding'
            }
          }
        ]
      }
    });
  }

  /** pricing.html  —  Product / Offer schemas per tier */
  function schemaPricing() {
    var tiers = [
      {
        name: 'Starter System',
        description: 'Best for early-stage businesses launching their digital presence. Includes website launch system, core UI/UX design, performance optimization, basic SEO setup, and launch support.',
        priceCurrency: 'INR',
        price: 'Custom',
        priceSpecification: {
          '@type': 'PriceSpecification',
          priceCurrency: 'INR',
          price: 'Custom',
          description: 'Custom pricing per project'
        }
      },
      {
        name: 'Growth System',
        description: 'Best for scaling businesses ready to grow predictably. Includes everything in Starter plus growth marketing system, conversion optimization, advanced analytics, and priority support.',
        priceCurrency: 'INR',
        price: 'Custom',
        priceSpecification: {
          '@type': 'PriceSpecification',
          priceCurrency: 'INR',
          price: 'Custom',
          description: 'Custom pricing per project'
        }
      },
      {
        name: 'Enterprise System',
        description: 'Best for organizations with complex needs and scale requirements. Includes custom digital systems, tech modernization, security & compliance, dedicated team, and ongoing optimization.',
        priceCurrency: 'INR',
        price: 'Custom',
        priceSpecification: {
          '@type': 'PriceSpecification',
          priceCurrency: 'INR',
          price: 'Custom',
          description: 'Custom pricing per project'
        }
      }
    ];

    inject({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'NueEra Pricing Plans',
      description: 'Transparent pricing for scalable digital systems — Starter, Growth, and Enterprise.',
      url: SITE_URL + '/pricing.html',
      numberOfItems: tiers.length,
      itemListElement: tiers.map(function (tier, idx) {
        return {
          '@type': 'ListItem',
          position: idx + 1,
          item: {
            '@type': 'Product',
            name: tier.name,
            description: tier.description,
            brand: { '@type': 'Brand', name: 'NueEra' },
            offers: {
              '@type': 'Offer',
              priceCurrency: tier.priceCurrency,
              price: tier.price,
              priceSpecification: tier.priceSpecification,
              availability: 'https://schema.org/InStock',
              url: SITE_URL + '/contact.html',
              seller: ORG_SCHEMA
            }
          }
        };
      })
    });
  }

  /** blog.html  —  Blog with blogPost items */
  function schemaBlog() {
    inject({
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'NueEra Blog - Insights on Digital Transformation',
      url: SITE_URL + '/blog.html',
      description: 'Latest insights on digital transformation, technology trends, and growth strategies.',
      publisher: ORG_SCHEMA,
      blogPost: [
        {
          '@type': 'BlogPosting',
          headline: 'The Future of Web Development in 2026',
          description: 'How AI-powered tooling, performance budgets, and edge computing are reshaping modern web systems.',
          datePublished: '2026-01-15',
          author: ORG_SCHEMA,
          publisher: ORG_SCHEMA,
          url: SITE_URL + '/blog-post.html',
          image: OG_IMAGE,
          mainEntityOfPage: SITE_URL + '/blog-post.html'
        },
        {
          '@type': 'BlogPosting',
          headline: 'Building Mobile-First Applications',
          description: 'Learn how to design and develop applications that prioritize mobile users with responsive design, touch-optimized interfaces, and offline capabilities.',
          datePublished: '2026-01-12',
          author: ORG_SCHEMA,
          publisher: ORG_SCHEMA
        },
        {
          '@type': 'BlogPosting',
          headline: 'Digital Marketing ROI: Measuring What Matters',
          description: 'Discover how to track, measure, and optimize your digital marketing campaigns for maximum ROI and meaningful business impact.',
          datePublished: '2026-01-10',
          author: ORG_SCHEMA,
          publisher: ORG_SCHEMA
        },
        {
          '@type': 'BlogPosting',
          headline: 'UX Design Principles That Convert',
          description: 'Understand the core principles of user-centered design that increase conversions, engagement, and customer satisfaction.',
          datePublished: '2026-01-08',
          author: ORG_SCHEMA,
          publisher: ORG_SCHEMA
        },
        {
          '@type': 'BlogPosting',
          headline: 'Web Security Best Practices for 2026',
          description: 'Essential security practices for protecting your digital assets including encryption, authentication, compliance, and threat prevention.',
          datePublished: '2026-01-05',
          author: ORG_SCHEMA,
          publisher: ORG_SCHEMA
        },
        {
          '@type': 'BlogPosting',
          headline: 'AI in Business: A Practical Guide',
          description: 'Explore practical applications of artificial intelligence and machine learning for business automation, analytics, and competitive advantage.',
          datePublished: '2026-01-02',
          author: ORG_SCHEMA,
          publisher: ORG_SCHEMA
        }
      ]
    });
  }

  /** blog-post.html  —  Article with author/publisher */
  function schemaBlogPost() {
    inject({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Why Your Digital Systems Cost More Than They Should',
      alternativeHeadline: 'A practical playbook to reduce waste, recover speed, and build one reliable source of truth',
      description: 'Why Your Digital Systems Cost More Than They Should — and how to fix it.',
      url: SITE_URL + '/blog-post.html',
      datePublished: '2026-01-28',
      dateModified: '2026-01-28',
      image: OG_IMAGE,
      author: {
        '@type': 'Person',
        name: 'Ravi Kambale',
        jobTitle: 'Operations & Delivery Lead',
        worksFor: ORG_SCHEMA,
        url: SITE_URL + '/team.html'
      },
      publisher: {
        '@type': 'Organization',
        name: 'NueEra',
        url: SITE_URL,
        logo: {
          '@type': 'ImageObject',
          url: LOGO
        }
      },
      mainEntityOfPage: SITE_URL + '/blog-post.html',
      articleSection: 'Development and Strategy',
      wordCount: 1200,
      about: {
        '@type': 'Thing',
        name: 'Digital Systems Integration',
        description: 'Reducing cost and complexity through connected digital systems.'
      }
    });
  }

  /** testimonials.html  —  Review + AggregateRating */
  function schemaTestimonials() {
    inject({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'NueEra',
      url: SITE_URL,
      review: [
        {
          '@type': 'Review',
          author: {
            '@type': 'Person',
            name: 'Sarah Chen'
          },
          reviewBody: 'Within 3 months, project tracking time dropped by 40%. Our team moved faster, and we finally had clarity on what was actually happening across departments.',
          reviewRating: {
            '@type': 'Rating',
            ratingValue: '5',
            bestRating: '5'
          },
          itemReviewed: {
            '@type': 'Service',
            name: 'NueEra Operations Consulting'
          }
        },
        {
          '@type': 'Review',
          author: {
            '@type': 'Person',
            name: 'Michael Rodriguez'
          },
          reviewBody: "We've had zero downtime since the rebuild. More importantly, I sleep better knowing our platform is solid. Growth no longer feels risky.",
          reviewRating: {
            '@type': 'Rating',
            ratingValue: '5',
            bestRating: '5'
          },
          itemReviewed: {
            '@type': 'Service',
            name: 'NueEra Digital Product Development'
          }
        },
        {
          '@type': 'Review',
          author: {
            '@type': 'Person',
            name: 'Lisa Hampton'
          },
          reviewBody: 'Conversion rates increased 28% in the first 6 months. But the real win was understanding our customers better. Now every decision is backed by insight.',
          reviewRating: {
            '@type': 'Rating',
            ratingValue: '5',
            bestRating: '5'
          },
          itemReviewed: {
            '@type': 'Service',
            name: 'NueEra Growth Marketing'
          }
        }
      ],
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        bestRating: '5',
        ratingCount: '4',
        reviewCount: '3'
      }
    });
  }

  /** help-center.html  —  FAQPage */
  function schemaHelpCenter() {
    inject({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How do I get started with NueEra?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Simply book a free strategy call or contact us via email. We\'ll schedule a discovery session to understand your needs and propose a tailored solution.'
          }
        },
        {
          '@type': 'Question',
          name: 'What happens after project launch?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: "We don't just hand over the keys and leave. We offer a warranty period followed by optional support and maintenance packages to ensure your system continues to perform."
          }
        },
        {
          '@type': 'Question',
          name: 'Do you offer ongoing support?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. We provide various tiers of ongoing support, from security updates and hosting management to continuous feature development and optimization.'
          }
        },
        {
          '@type': 'Question',
          name: 'Can I upgrade my service later?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Absolutely. Our systems are built to scale. You can start with a core package and add features, integrations, or marketing services as your business grows.'
          }
        },
        {
          '@type': 'Question',
          name: 'How do you handle security and data privacy?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: "Security is foundational to our process. We use industry-standard encryption, secure hosting environments, and regular audits to protect your data and your customers' privacy."
          }
        },
        {
          '@type': 'Question',
          name: 'Do you offer custom pricing?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, for our Enterprise clients or projects with unique requirements, we provide custom quotes based on the specific scope and complexity.'
          }
        },
        {
          '@type': 'Question',
          name: 'Can I upgrade later?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: "Absolutely. Many clients start with the Starter System and upgrade to Growth as their business scales and needs evolve."
          }
        },
        {
          '@type': 'Question',
          name: 'Do you provide ongoing support after launch?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, all our plans include a warranty period. Beyond that, we offer dedicated support plans to ensure your system remains secure and performant.'
          }
        }
      ]
    });
  }

  /** contact.html  —  ContactPage */
  function schemaContact() {
    inject({
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: 'Contact Us | NueEra - Get a Free Strategy Call',
      url: SITE_URL + '/contact.html',
      description: 'Contact NueEra - Get a free consultation for your digital project. We respond within 24 hours.',
      mainEntity: {
        '@type': 'Organization',
        name: 'NueEra',
        url: SITE_URL,
        logo: LOGO,
        telephone: '+917066607424',
        email: 'hello@nueera.io',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Kothrud',
          addressLocality: 'Pune',
          addressRegion: 'Maharashtra',
          addressCountry: 'IN'
        },
        contactPoint: [
          {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            email: 'hello@nueera.io',
            availableLanguage: ['English', 'Hindi', 'Marathi'],
            hoursAvailable: {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
              opens: '09:00',
              closes: '18:00'
            }
          },
          {
            '@type': 'ContactPoint',
            contactType: 'sales',
            email: 'hello@nueera.io',
            telephone: '+917066607424',
            availableLanguage: ['English', 'Hindi', 'Marathi']
          }
        ]
      }
    });
  }

  /** team.html  —  Organization + Person schemas */
  function schemaTeam() {
    var teamMembers = [
      {
        name: 'Nil Shinde',
        jobTitle: 'Founder & CEO',
        description: 'Nil founded NueEra with the belief that technology should simplify business. With years of experience, he combines strategic thinking with hands-on problem-solving.',
        knowsAbout: ['Strategy', 'Leadership', 'Business Growth'],
        image: SITE_URL + '/assets/images/profiles/nil_shinde.jpg'
      },
      {
        name: 'Dipanshu Awandkar',
        jobTitle: 'Technical Lead',
        description: "Dipanshu leads all technical decisions, bringing expertise in scalable systems. He's passionate about clean code and sustainable architecture.",
        knowsAbout: ['Architecture', 'Full-Stack Development', 'DevOps'],
        image: SITE_URL + '/assets/images/profiles/dipanshu_awandkar.jpg'
      },
      {
        name: 'Vikrant Salunke',
        jobTitle: 'Design Lead',
        description: "Vikrant leads UX/UI at NueEra. He believes design is about solving problems, not just aesthetics, creating products that users actually want to use.",
        knowsAbout: ['UX Strategy', 'UI Design', 'User Research'],
        image: SITE_URL + '/assets/images/profiles/vikrant_salunke.jpg'
      },
      {
        name: 'Tisha Dalvi',
        jobTitle: 'UI/UX Design Lead',
        description: 'Tisha leads user experience and interface design. She creates intuitive, research-driven designs that balance usability, aesthetics, and real business needs.',
        knowsAbout: ['UX Strategy', 'UI Design', 'User Research'],
        image: SITE_URL + '/assets/images/profiles/tisha_dalavi.jpg'
      },
      {
        name: 'Saurabh Shinde',
        jobTitle: 'Marketing & Growth Lead',
        description: 'Saurabh drives brand growth and visibility. He focuses on storytelling, content, and digital strategies that connect NueEra with the right audience.',
        knowsAbout: ['Growth Strategy', 'Content Marketing', 'Brand Building'],
        image: SITE_URL + '/assets/images/profiles/saurabh_shinde.jpg'
      },
      {
        name: 'Sandhya Shinde',
        jobTitle: 'Sales & Client Partnerships Lead',
        description: 'Sandhya builds strong client relationships by understanding business needs and aligning them with the right digital solutions.',
        knowsAbout: ['Sales Strategy', 'Client Relationships', 'Partnerships'],
        image: SITE_URL + '/assets/images/profiles/sandhya_shinde.jpg'
      },
      {
        name: 'Mrunmayee Jawale',
        jobTitle: 'Product Strategy Lead',
        description: 'Mrunmayee leads product vision and strategy at NueEra, ensuring every solution aligns with business goals and user needs.',
        knowsAbout: ['Product Strategy', 'Roadmapping', 'User-Centric Thinking'],
        image: SITE_URL + '/assets/images/profiles/mrunmayee_Jawale.jpeg'
      },
      {
        name: 'Ravi Kamble',
        jobTitle: 'Operations & Delivery Lead',
        description: 'Ravi ensures smooth project execution across teams. He manages workflows, timelines, and resources to deliver projects efficiently and on schedule.',
        knowsAbout: ['Operations Management', 'Efficiency', 'Agile Delivery'],
        image: SITE_URL + '/assets/images/profiles/ravi_kambale.jpg'
      },
      {
        name: 'Vaibhav Nijampurkar',
        jobTitle: 'Process & Business Development Lead',
        description: 'Vaibhav focuses on improving internal processes and identifying new business opportunities that help clients and teams scale effectively.',
        knowsAbout: ['Process Design', 'Business Development', 'Client Solutions'],
        image: SITE_URL + '/assets/images/profiles/vaibhav_nijampurkar.jpg'
      },
      {
        name: 'Vivek Tethgure',
        jobTitle: 'Process Optimization Lead',
        description: 'Vivek works on improving operational efficiency and consistency. He focuses on refining workflows and ensuring sustainable performance across projects.',
        knowsAbout: ['Process Optimization', 'Operational Strategy', 'Quality Control'],
        image: SITE_URL + '/assets/images/profiles/vivek_tethgure.jpg'
      },
      {
        name: 'Nagesh Banger',
        jobTitle: 'Motion Graphics & Video Content Lead',
        description: 'Nagesh brings ideas to life through animation and video. He creates engaging visual content that strengthens brand communication and storytelling.',
        knowsAbout: ['Animation', 'Video Production', 'Visual Storytelling'],
        image: SITE_URL + '/assets/images/profiles/nagesh_banger.jpg'
      }
    ];

    inject({
      '@context': 'https://schema.org',
      '@graph': [
        Object.assign({ '@id': SITE_URL + '#organization' }, ORG_SCHEMA, {
          employee: teamMembers.map(function (m) {
            return { '@id': SITE_URL + '/team.html#' + m.name.split(' ').join('_').toLowerCase() };
          })
        }),
        {
          '@type': 'WebPage',
          name: 'Our Team | NueEra',
          url: SITE_URL + '/team.html',
          description: 'Meet the NueEra team - experienced digital strategists, engineers, and designers.',
          publisher: { '@id': SITE_URL + '#organization' }
        }
      ].concat(
        teamMembers.map(function (m) {
          return {
            '@type': 'Person',
            '@id': SITE_URL + '/team.html#' + m.name.split(' ').join('_').toLowerCase(),
            name: m.name,
            jobTitle: m.jobTitle,
            description: m.description,
            image: m.image,
            worksFor: { '@id': SITE_URL + '#organization' },
            knowsAbout: m.knowsAbout,
            url: SITE_URL + '/team.html'
          };
        })
      )
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Route map                                                           */
  /* ------------------------------------------------------------------ */
  var routes = {
    'index':        schemaIndex,
    'about':        schemaAbout,
    'services':     schemaServices,
    'pricing':      schemaPricing,
    'blog':         schemaBlog,
    'blog-post':    schemaBlogPost,
    'testimonials': schemaTestimonials,
    'help-center':  schemaHelpCenter,
    'contact':      schemaContact,
    'team':         schemaTeam
  };

  /* ------------------------------------------------------------------ */
  /*  Execute                                                             */
  /* ------------------------------------------------------------------ */
  var page = currentPage();
  if (routes[page]) {
    routes[page]();
  }

})();
