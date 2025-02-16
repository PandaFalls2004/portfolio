import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
let data = [];
let xScale, yScale, brushSelection = null;
// function brushed(event) {
//     console.log(event);
//   }
function updateLanguageBreakdown() {
    const selectedCommits = brushSelection
      ? commits.filter(isCommitSelected)
      : [];
    const container = document.getElementById('language-breakdown');
  
    if (selectedCommits.length === 0) {
      container.innerHTML = '';
      return;
    }
    const requiredCommits = selectedCommits.length ? selectedCommits : commits;
    const lines = requiredCommits.flatMap((d) => d.lines);
  
    // Use d3.rollup to count lines per language
    const breakdown = d3.rollup(
      lines,
      (v) => v.length,
      (d) => d.type
    );
  
    // Update DOM with breakdown
    container.innerHTML = '';
  
    for (const [language, count] of breakdown) {
      const proportion = count / lines.length;
      const formatted = d3.format('.1~%')(proportion);
  
      container.innerHTML += `
              <dt>${language}</dt>
              <dd>${count} lines (${formatted})</dd>
          `;
    }
  
    return breakdown;
  }
function brushSelector() {
    const svg = document.querySelector('svg');
    // d3.select(svg).call(d3.brush());
    d3.select(svg).call(d3.brush().on('start brush end', brushed));
    d3.select(svg).selectAll('.dots, .overlay ~ *').raise();
    // d3.select(svg).call(d3.brush().on('start brush end', brushed));
  }
  function updateSelectionCount() {
    const selectedCommits = brushSelection
      ? commits.filter(isCommitSelected)
      : [];
  
    const countElement = document.getElementById('selection-count');
    countElement.textContent = `${
      selectedCommits.length || 'No'
    } commits selected`;
  
    return selectedCommits;
  }
  function updateSelection() {
    // Update visual state of dots based on selection
    d3.selectAll('circle').classed('selected', (d) => isCommitSelected(d));
  }

function isCommitSelected(commit) {
    if (!brushSelection) return false;
  
    const min = { x: brushSelection[0][0], y: brushSelection[0][1] };
    const max = { x: brushSelection[1][0], y: brushSelection[1][1] };
  
    const x = xScale(commit.date);
    const y = yScale(commit.hourFrac);
  
    return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
  }
  function brushed(event) {
    console.log(event);
  brushSelection = event.selection;
  updateSelection();
  updateSelectionCount();
  updateLanguageBreakdown();
}


// const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
// const rScale = d3.scaleSqrt().domain([minLines, maxLines]).range([2, 30]); // adjust these values based on your experimentation
// data = await d3.csv('loc.csv');
// async function loadData() {
//     data = await d3.csv('loc.csv');
//     console.log(data);
// }
  

// async function loadData() {
//     data = await d3.csv('loc.csv', (row) => ({
//       ...row,
//       line: Number(row.line), // or just +row.line
//       depth: Number(row.depth),
//       length: Number(row.length),
//       date: new Date(row.date + 'T00:00' + row.timezone),
//       datetime: new Date(row.datetime),
//     }));
//  }
let commits = []

function processCommits() {
    commits = d3
      .groups(data, (d) => d.commit)
      .map(([commit, lines]) => {
        let first = lines[0];
        let { author, date, time, timezone, datetime } = first;
        let ret = {
          id: commit,
          url: 'https://github.com/PandaFalls2004/portfolio/commit/' + commit,
          author,
          date,
          time,
          timezone,
          datetime,
          hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
          totalLines: lines.length,
        };
  
        Object.defineProperty(ret, 'lines', {
          value: lines,
          // What other options do we need to set?
          // Hint: look up configurable, writable, and enumerable
          writable: false,
          enumerable: false,
          configurable: false
          
        });
  
        return ret;
      });
  }
  function displayStats() {
    // Process commits first
    processCommits();
  
    // Create the dl element
    const dl = d3.select('#stats').append('dl').attr('class', 'stats');
  
    // Add total LOC
    dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
    dl.append('dd').text(data.length);
  
    // Add total commits
    dl.append('dt').text('Total commits');
    dl.append('dd').text(commits.length);
  
    // Number of files
    const numFiles = d3.group(data, (d) => d.file).size;
    dl.append('dt').text('Number of files');
    dl.append('dd').text(numFiles);
  
    // Maximum file length (in lines)
    const maxFileLength = d3.max(
      d3.rollups(data, (v) => v.length, (d) => d.file),
      (d) => d[1]
    );
    dl.append('dt').text('Maximum file length (lines)');
    dl.append('dd').text(maxFileLength);
  
    // Average line length (in characters)
    const avgLineLength = d3.mean(data, (d) => d.length);
    dl.append('dt').text('Average line length (characters)');
    dl.append('dd').text(avgLineLength.toFixed(2));
  
    // Longest line length
    const longestLineLength = d3.max(data, (d) => d.length);
    dl.append('dt').text('Longest line length');
    dl.append('dd').text(longestLineLength);
  
    // Maximum depth
    const maxDepth = d3.max(data, (d) => d.depth);
    dl.append('dt').text('Maximum depth');
    dl.append('dd').text(maxDepth);
  
    // Time of day most work is done
    const workByPeriod = d3.rollups(
      data,
      (v) => v.length,
      (d) => new Date(d.datetime).toLocaleString('en', { dayPeriod: 'short' })
    );
    const maxPeriod = d3.greatest(workByPeriod, (d) => d[1])?.[0];
    dl.append('dt').text('Most active time of day');
    dl.append('dd').text(maxPeriod);
  }
  async function loadData() {
    // original function as before
    data = await d3.csv('loc.csv', (row) => ({
        ...row,
        line: Number(row.line), // or just +row.line
        depth: Number(row.depth),
        length: Number(row.length),
        date: new Date(row.date + 'T00:00' + row.timezone),
        datetime: new Date(row.datetime),
      }));
    
    // processCommits();
    displayStats();
    console.log(commits);
  }
  function updateTooltipVisibility(isVisible) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.hidden = !isVisible;
  }
  function updateTooltipContent(commit) {
    const link = document.getElementById('commit-link');
    const date = document.getElementById('commit-date');
  
    if (Object.keys(commit).length === 0) return;
  
    link.href = commit.url;
    link.textContent = commit.id;
    date.textContent = commit.datetime?.toLocaleString('en', {
      dateStyle: 'full',
    });
  }
  function updateTooltipPosition(event) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.style.left = `${event.clientX}px`;
    tooltip.style.top = `${event.clientY}px`;
  }

  async function createScatterplot(){
    const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
    const rScale = d3.scaleSqrt().domain([minLines, maxLines]).range([2, 30]); // adjust these values based on your experimentation
    const sortedCommits = d3.sort(commits, (d) => -d.totalLines);
    const width = 1000;
    const height = 600;
    const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');
    brushSelector();
    xScale = d3.scaleTime()
    .domain(d3.extent(data, d => d.date))
    .range([50, width - 50]);

    yScale = d3.scaleLinear()
    .domain([0, 1])
    .range([height - 50, 50]);
    const margin = { top: 10, right: 10, bottom: 30, left: 20 };
    const usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left,
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bottom,
      };
      
      // Update scales with new ranges
      xScale.range([usableArea.left, usableArea.right]);
      yScale.range([usableArea.bottom, usableArea.top]);
// Add gridlines BEFORE the axes
const gridlines = svg
  .append('g')
  .attr('class', 'gridlines')
  .attr('transform', `translate(${usableArea.left}, 0)`);

// Create gridlines as an axis with no labels and full-width ticks
gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));
      // Create the axes
const xAxis = d3.axisBottom(xScale);
// const yAxis = d3.axisLeft(yScale);
const yAxis = d3
  .axisLeft(yScale)
  .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

// Add X axis
svg
  .append('g')
  .attr('transform', `translate(0, ${usableArea.bottom})`)
  .call(xAxis);

// Add Y axis
svg
  .append('g')
  .attr('transform', `translate(${usableArea.left}, 0)`)
  .call(yAxis);
    const dots = svg.append('g').attr('class', 'dots');

    dots
    .selectAll('circle')
    .data(sortedCommits)
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', 5)
    .attr('fill', 'steelblue')
    .attr('r', (d) => rScale(d.totalLines))
    .style('fill-opacity', 0.7) // Add transparency for overlapping dots
    dots.on('mouseenter', (event, commit) => {
        d3.select(event.currentTarget).style('fill-opacity', 1);
        updateTooltipContent(commit);
        updateTooltipVisibility(true);
        updateTooltipPosition(event);
      })
  .on('mouseleave', () => {
    d3.select(event.currentTarget).style('fill-opacity', 0.7);
    updateTooltipContent({});
    updateTooltipVisibility(false);
  });
//     const margin = { top: 10, right: 10, bottom: 30, left: 20 };
//     const usableArea = {
//         top: margin.top,
//         right: width - margin.right,
//         bottom: height - margin.bottom,
//         left: margin.left,
//         width: width - margin.left - margin.right,
//         height: height - margin.top - margin.bottom,
//       };
      
//       // Update scales with new ranges
//       xScale.range([usableArea.left, usableArea.right]);
//       yScale.range([usableArea.bottom, usableArea.top]);
//       // Create the axes
// const xAxis = d3.axisBottom(xScale);
// // const yAxis = d3.axisLeft(yScale);
// const yAxis = d3
//   .axisLeft(yScale)
//   .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

// // Add X axis
// svg
//   .append('g')
//   .attr('transform', `translate(0, ${usableArea.bottom})`)
//   .call(xAxis);

// // Add Y axis
// svg
//   .append('g')
//   .attr('transform', `translate(${usableArea.left}, 0)`)
//   .call(yAxis);
}
  document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    await createScatterplot();
  });
 



 