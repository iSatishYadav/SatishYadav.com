'use strict';

const projectDetails = {
  bitss: {
    category: 'ENTERPRISE / MACHINE LEARNING', title: 'BPCL IT Services System',
    intro: 'A comprehensive in-house IT services platform serving BPCL employees and consultants.',
    sections: [
      ['THE PROBLEM', 'Support is more than ticketing. People need a connected way to get help, follow requests, and reduce repetitive operational work.'],
      ['MY CONTRIBUTION', 'Architected, designed, and developed BITSS, bringing together service requests, automation, paperless workflows, chatbot capabilities, integrations, and network monitoring. Developed an in-house machine-learning model for the organization’s ITSM.'],
      ['RECOGNITION', 'The machine-learning initiative received a Digital PSU Award. My professional profile describes reduced manual effort for support desk engineers; this portfolio does not attach an independently unverified numerical claim.'],
      ['THE TOOLKIT', 'C# · ASP.NET · SQL Server · Entity Framework · SignalR · ML.NET · Microsoft Bot Framework']
    ]
  },
  api: {
    category: 'PLATFORM / IDENTITY', title: 'Centralized API Platform',
    intro: 'A shared foundation for secure API development and authorization across enterprise teams.',
    sections: [
      ['THE PROBLEM', 'Independent applications still need a consistent approach to API onboarding, client identity, and authorization.'],
      ['MY CONTRIBUTION', 'Envisioned, architected, designed, and developed the BPCL API Platform. The offering included an API and client onboarding portal, an OAuth authorization server for issuing JWT access tokens, and a Visual Studio API template.'],
      ['THE APPROACH', 'Make the standard path reusable: provide shared identity infrastructure and a developer starting point instead of leaving each team to recreate the same foundation.'],
      ['THE TOOLKIT', 'Angular · ASP.NET Core · C# · OpenID Connect · OAuth · JWT · Azure AD · SQL Server']
    ]
  },
  sms: {
    category: 'MESSAGING / INTEGRATION', title: 'SMS Pro',
    intro: 'An enterprise unified messaging platform for critical communications across BPCL applications.',
    sections: [
      ['THE PROBLEM', 'Applications need to send transactional, service, and OTP messages while tracking delivery and integrating with messaging providers.'],
      ['MY CONTRIBUTION', 'Architected, designed, and developed a suite including OAuth-based REST APIs, distributed processing queues, webhooks, command-line interfaces, libraries, onboarding, dashboards, and reports.'],
      ['THE APPROACH', 'Connect request ingestion, provider integration, delivery events, and reporting in a unified platform.'],
      ['THE TOOLKIT', 'OAuth 2 · OpenAPI · MSMQ · C# · ASP.NET MVC · Node.js · Hangfire · Entity Framework']
    ]
  },
  ideas: {
    category: 'INNOVATION / ENGAGEMENT', title: 'Enterprise Ideas Platform',
    intro: 'An idea-management platform for engagement, innovation, rewards, and recognition.',
    sections: [
      ['THE INTENT', 'Create a dedicated place for enterprise ideas and the people behind them.'],
      ['MY CONTRIBUTION', 'Led development of the Enterprise Idea Management Platform at BPCL. The project is listed in my professional profile from November 2023 onward.'],
      ['THE TOOLKIT', 'ASP.NET Core · Enterprise web application development'],
      ['WHAT COMES NEXT', 'A deeper case study can be added when approved screenshots and project-specific outcomes are available. No internal materials are published here.']
    ]
  },
  measurement: {
    category: 'DIGITIZATION / PAPERLESS WORKFLOWS', title: 'E-Measurement Book',
    intro: 'A paperless enterprise measurement-book initiative at Bharat Petroleum, developed between June 2021 and October 2022.',
    sections: [
      ['THE INTENT', 'Digitize the measurement-book process and reduce dependence on paper-based enterprise workflows.'],
      ['MY CONTRIBUTION', 'Architected and developed the E-Measurement Book application. My published project history lists ASP.NET Core and enterprise web development among its technologies.'],
      ['RECOGNITION', 'The initiative received Gold at the Global Petroleum Awards at the World Petroleum Technology Congress in 2022. My activity history also records ET Ascent recognition for the enterprise digitization initiative in Environmental Sustainability and Digital PSU categories. These are credited to the initiative, not presented as individual awards.'],
      ['THE TOOLKIT', 'ASP.NET Core · C# · TypeScript · Enterprise web application development']
    ]
  }
};

const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('open');
}
menuToggle.addEventListener('click', () => {
  const opened = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(opened));
  navigation.classList.toggle('open', opened);
});
navigation.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
window.matchMedia('(min-width: 761px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

const dialog = document.querySelector('#project-dialog');
let previousFocus;
document.querySelectorAll('[data-project]').forEach(button => {
  button.addEventListener('click', () => {
    const project = projectDetails[button.dataset.project];
    previousFocus = button;
    document.querySelector('#dialog-category').textContent = project.category;
    document.querySelector('#dialog-title').textContent = project.title;
    document.querySelector('#dialog-intro').textContent = project.intro;
    const blocks = project.sections.map(([heading, text]) => {
      const block = document.createElement('section');
      block.className = 'dialog-block';
      const title = document.createElement('h3');
      title.textContent = heading;
      const paragraph = document.createElement('p');
      paragraph.textContent = text;
      block.append(title, paragraph);
      return block;
    });
    document.querySelector('#dialog-content').replaceChildren(...blocks);
    dialog.showModal();
    document.body.classList.add('dialog-open');
  });
});
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
dialog.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    event.preventDefault();
    dialog.close();
  }
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  previousFocus?.focus({ preventScroll: true });
});

let articles = [];
let activeFilter = 'all';
const articleList = document.querySelector('#article-list');
const search = document.querySelector('#article-search');
const archiveStatus = document.querySelector('#archive-status');
function renderArticles() {
  const query = search.value.trim().toLocaleLowerCase();
  const filtered = articles.filter(article =>
    (activeFilter === 'all' || article.category === activeFilter) &&
    `${article.title} ${article.category}`.toLocaleLowerCase().includes(query)
  );
  const links = filtered.map(article => {
    const link = document.createElement('a');
    link.className = 'archive-row';
    link.href = article.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    const date = document.createElement('time');
    date.dateTime = article.date.slice(0, 10);
    date.textContent = article.date.slice(0, 4);
    const text = document.createElement('div');
    const title = document.createElement('h3');
    title.textContent = article.title;
    const tag = document.createElement('span');
    tag.className = 'archive-tag';
    tag.textContent = article.category === 'dotnet' ? '.NET ECOSYSTEM' : article.category === 'engineering' ? 'ENGINEERING' : 'TOOLS & LIFE';
    const arrow = document.createElement('span');
    arrow.textContent = '↗';
    arrow.setAttribute('aria-hidden', 'true');
    text.append(title, tag);
    link.append(date, text, arrow);
    return link;
  });
  articleList.replaceChildren(...links);
  archiveStatus.textContent = filtered.length ? `${filtered.length} of ${articles.length} articles · original publication years` : 'No field notes match. Try another search or category.';
}
search.addEventListener('input', renderArticles);
document.querySelectorAll('.filter').forEach(button => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll('.filter').forEach(filter => {
      const selected = filter === button;
      filter.classList.toggle('active', selected);
      filter.setAttribute('aria-pressed', String(selected));
    });
    renderArticles();
  });
});
fetch('articles.json').then(response => {
  if (!response.ok) throw new Error('Article index unavailable');
  return response.json();
}).then(data => { articles = data; renderArticles(); }).catch(() => {
  archiveStatus.textContent = 'The writing index could not load. The featured links and full blog remain available.';
});
document.querySelector('#year').textContent = new Date().getFullYear();
