module.exports = {
  assembleContext: function (params) {
    const sections = ['role', 'quality-rules', 'framework', 'a11y'];
    if (params.componentLibrary) {
      sections.push('library');
    }
    let prompt =
      'You are a ' +
      params.framework +
      ' component generator.\n\n' +
      'Quality rules: Follow best practices.\n\n' +
      'Framework: ' +
      params.framework +
      ' conventions.\n\n' +
      'Accessibility: WCAG 2.1 AA compliance.';
    if (params.componentLibrary) {
      prompt += '\n\nLibrary: Use ' + params.componentLibrary + ' components.';
    }
    return {
      systemPrompt: prompt,
      tokenEstimate: Math.ceil(prompt.length / 4),
      examplesIncluded: 0,
      sectionsIncluded: sections,
    };
  },
};
