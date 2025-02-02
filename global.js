console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}
const ARE_WE_HOME = document.documentElement.classList.contains('home');

// let navLinks=$$("nav a");

// let currentLink = navLinks.find(
//     (a) => a.host === location.host && a.pathname === location.pathname
//   );
// second option   
// currentLink?.classList.add('current');
let pages = [
    { url: '', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    { url: 'contact/', title: 'Contact' }, 
    { url: 'resume/', title: 'Resume' },
    { url: 'https://github.com/PandaFalls2004', title: 'Github' }
];

let nav = document.createElement('nav');
document.body.prepend(nav);
for (let p of pages) {
    let url = p.url;
    let title = p.title;
    // TODO create link and add it to nav
    // nav.insertAdjacentHTML('beforeend', `<a href="${url}">${title}</a>`);
    // const ARE_WE_HOME = document.documentElement.classList.contains('home');
    url = !ARE_WE_HOME && !url.startsWith('http') ? '../' + url : url;
    // if (!ARE_WE_HOME && !url.startsWith('http')) {
    //     url = '../' + url;
    //   }
    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;
    if (a.host === location.host && a.pathname === location.pathname) {
        a.classList.add('current');
      }
    //   a.classList.toggle(
    //     'current',
    //     a.host === location.host && a.pathname === location.pathname
    //   );
    nav.append(a);
    // const ARE_WE_HOME = document.documentElement.classList.contains('home');
    // url = !ARE_WE_HOME && !url.startsWith('http') ? '../' + url : url;
  }
  document.body.insertAdjacentHTML(
    'afterbegin',
    `
      <label class="color-scheme">
          Theme:
          <select>
              <option>Automatic</option>
              <option> Light</option>
              <option> Dark</option>
          </select>
      </label>`
  );
//   select.addEventListener('input', function (event) {
//     console.log('color scheme changed to', event.target.value);
//     document.documentElement.style.setProperty('color-scheme', event.target.value);
//   });
//   document.documentElement.style.setProperty('color-scheme', event.target.value);
const select = document.querySelector('.color-scheme');
select.addEventListener('input', function (event) {
    console.log('color scheme changed to', event.target.value);
    document.documentElement.style.setProperty('color-scheme', event.target.value);
  });
  function updateColorScheme(value) {
    document.documentElement.style.setProperty('color-scheme', value);
    select.value = value;  // Update the select element to reflect the current scheme
  }

  // Check if there's a saved preference in localStorage and apply it
  if ('colorScheme' in localStorage) {
    updateColorScheme(localStorage.colorScheme);
  }

  // Add an event listener for the 'input' event
  select.addEventListener('input', function (event) {
    console.log('color scheme changed to', event.target.value);

    // Update the color scheme and store the preference in localStorage
    updateColorScheme(event.target.value);
    localStorage.colorScheme = event.target.value;
  });
// Fetch JSON data from a given URL
export async function fetchJSON(url) {
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch projects: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching or parsing JSON data:', error);
    }
}

// Render projects dynamically on the page
export function renderProjects(projects, containerElement) {
    if (!containerElement) {
        console.error('Invalid container element');
        return;
    }

    // Clear existing content to avoid duplication
    containerElement.innerHTML = '';

    // Loop through each project and create an article
    projects.forEach(project => {
        const article = document.createElement('article');

        // Handle missing data gracefully
        const title = project.title || 'Untitled Project';
        const image = project.image ? `<img src="${project.image}" alt="${project.title || 'Project Image'}" style="max-width: 150px; height: auto;">` : '';
        const description = project.description || 'No description available.';

        // Set the innerHTML with dynamic content
        article.innerHTML = `
            <h2>${title}</h2>
            ${image}
            <p>${description}</p>
        `;

        // Append the article to the container
        containerElement.appendChild(article);
    });
    const projectCountElement = document.querySelector('.projects-title');
    if (projectCountElement) {
        projectCountElement.textContent = `Projects (${projects.length})`;
    } else {
        console.error('Element with class "projects-title" not found.');
    }
}
export async function fetchGitHubData(username) {
    // return statement here
    return fetchJSON(`https://api.github.com/users/${username}`);
  }



