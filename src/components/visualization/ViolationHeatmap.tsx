import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { WeeklyData, VIOLATION_LABELS, Violation } from '../../types';

interface ViolationHeatmapProps {
  data: WeeklyData;
}

export const ViolationHeatmap: React.FC<ViolationHeatmapProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 40, right: 30, bottom: 40, left: 150 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Prepare data
    const days = data.dailyRecords.map(r => r.day);
    const vTypes = Object.keys(VIOLATION_LABELS) as (Violation['type'])[];
    
    interface HeatmapPoint {
      day: string;
      type: string;
      count: number;
    }

    const heatmapData: HeatmapPoint[] = [];
    days.forEach((day, dayIdx) => {
      const record = data.dailyRecords[dayIdx];
      vTypes.forEach(type => {
        const count = record.violations
          .filter(v => v.type === type)
          .reduce((sum, v) => sum + v.count, 0);
        heatmapData.push({ day, type: VIOLATION_LABELS[type], count });
      });
    });

    // Scales
    const x = d3.scaleBand()
      .range([0, width])
      .domain(days)
      .padding(0.05);

    const y = d3.scaleBand()
      .range([height, 0])
      .domain(vTypes.map(t => VIOLATION_LABELS[t]))
      .padding(0.05);

    const color = d3.scaleSequential()
      .interpolator(d3.interpolateYlOrRd)
      .domain([0, Math.max(1, d3.max(heatmapData, d => d.count) || 1)]);

    // Axes
    g.append("g")
      .style("font-size", "10px")
      .style("font-family", "monospace")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSize(0))
      .select(".domain").remove();

    g.append("g")
      .style("font-size", "10px")
      .style("font-family", "monospace")
      .call(d3.axisLeft(y).tickSize(0))
      .select(".domain").remove();

    // Rects
    g.selectAll()
      .data(heatmapData)
      .enter()
      .append("rect")
      .attr("x", d => x(d.day) || 0)
      .attr("y", d => y(d.type) || 0)
      .attr("rx", 2)
      .attr("ry", 2)
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .style("fill", d => d.count === 0 ? "#f9f9f9" : color(d.count))
      .style("stroke-width", 1)
      .style("stroke", "#eee")
      .style("opacity", 0.8)
      .on("mouseover", function(event, d) {
        d3.select(this).style("opacity", 1).style("stroke", "#141414");
      })
      .on("mouseleave", function() {
        d3.select(this).style("opacity", 0.8).style("stroke", "#eee");
      });

    // Labels
    g.selectAll()
      .data(heatmapData)
      .enter()
      .append("text")
      .attr("x", d => (x(d.day) || 0) + x.bandwidth() / 2)
      .attr("y", d => (y(d.type) || 0) + y.bandwidth() / 2)
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", d => d.count > 2 ? "white" : "#141414")
      .text(d => d.count > 0 ? d.count : "");

    svg.append("text")
      .attr("x", margin.left)
      .attr("y", 20)
      .attr("text-anchor", "start")
      .style("font-size", "14px")
      .style("font-serif", "italic")
      .style("font-weight", "bold")
      .text("Biểu đồ nhiệt vi phạm trong tuần");

  }, [data]);

  return (
    <div className="bg-white border border-[#141414] p-6 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] overflow-hidden">
      <svg 
        ref={svgRef} 
        viewBox="0 0 800 400" 
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
      />
    </div>
  );
};
