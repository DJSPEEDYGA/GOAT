(function () {
  "use strict";

  class GoatSpectralAnalysis {
    peakBins(data) {
      if (!data || !data.length) return [];
      return [...data]
        .map((value, index) => ({ index, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
    }

    centroid(data) {
      if (!data || !data.length) return 0;
      let weighted = 0;
      let total = 0;
      data.forEach((value, index) => {
        weighted += index * value;
        total += value;
      });
      return total ? weighted / total : 0;
    }
  }

  window.GoatSpectralAnalysis = window.GoatSpectralAnalysis || GoatSpectralAnalysis;
  window.goatSpectralAnalysis = window.goatSpectralAnalysis || new GoatSpectralAnalysis();
  window.dispatchEvent(new CustomEvent("goat:spectral-analysis-ready"));
})();
