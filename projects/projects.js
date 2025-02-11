

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer);

let selectedIndex = -1; // No wedge selected by default

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let rolledData = d3.rollups(projects, (v) => v.length, (d) => d.year);
let data = rolledData.map(([year, count]) => ({ value: count, label: year }));

let sliceGenerator = d3.pie().value((d) => d.value);
let arcData = sliceGenerator(data);
let colors = d3.scaleOrdinal(d3.schemeTableau10);

let svg = d3.select('svg');
svg.selectAll('path').remove();

let legend = d3.select('.legend');
legend.html("");

// Append Pie Chart Slices
arcData.forEach((arc, i) => {
    svg.append('path')
        .attr('d', arcGenerator(arc))
        .attr('fill', colors(i))
        .attr('stroke', 'white')
        .attr('class', 'wedge')
        .style('cursor', 'pointer')
        .on('click', function () {
            selectedIndex = selectedIndex === i ? -1 : i;
            updateSelection();
            updateProjects();
        });
});

// Append Legend
legend.selectAll('li')
    .data(data)
    .enter()
    .append('li')
    .attr('style', (d, i) => `--color:${colors(i)}`)
    .html((d) => `<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
    .attr('class', 'legend-item')
    .on('click', function (_, i) {
        selectedIndex = selectedIndex === i ? -1 : i;
        updateSelection();
        updateProjects();
    });

// Function to Update Selection Styling
function updateSelection() {
    svg.selectAll('path')
        .attr('class', (_, idx) => (idx === selectedIndex ? 'selected' : ''));

    legend.selectAll('li')
        .attr('class', (_, idx) => (idx === selectedIndex ? 'selected' : 'legend-item'));
}

// Function to Filter and Render Projects
function updateProjects() {
    if (selectedIndex === -1) {
        renderProjects(projects, projectsContainer, 'h2'); // Show all projects
    } else {
        let selectedYear = data[selectedIndex].label;
        let filteredProjects = projects.filter((project) => project.year === selectedYear);
        renderProjects(filteredProjects, projectsContainer, 'h2'); // Show filtered projects
    }
}




