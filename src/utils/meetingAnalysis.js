export const emptyAnalysisSections = {
  title: '',
  summary: '',
  keyDiscussionPoints: '',
  actionItems: '',
  followUpEmail: '',
};

const sectionPatterns = {
  summary: [
    /(?:^|\n)\s*(?:#{1,4}\s*)?(?:\d+\.\s*)?(?:concise\s+)?summary(?:\s+of\s+the\s+meeting)?\s*:?\s*\n/i,
  ],
  keyDiscussionPoints: [
    /(?:^|\n)\s*(?:#{1,4}\s*)?(?:\d+\.\s*)?key\s+discussion\s+points\s*:?\s*\n/i,
    /(?:^|\n)\s*(?:#{1,4}\s*)?(?:\d+\.\s*)?discussion\s+points\s*:?\s*\n/i,
  ],
  actionItems: [
    /(?:^|\n)\s*(?:#{1,4}\s*)?(?:\d+\.\s*)?action\s+items(?:\s+with\s+owners)?\s*:?\s*\n/i,
  ],
  followUpEmail: [
    /(?:^|\n)\s*(?:#{1,4}\s*)?(?:\d+\.\s*)?professional\s+follow-?up\s+email\s+draft\s*:?\s*\n/i,
    /(?:^|\n)\s*(?:#{1,4}\s*)?(?:\d+\.\s*)?follow-?up\s+email\s*:?\s*\n/i,
  ],
  title: [
    /(?:^|\n)\s*(?:#{1,4}\s*)?(?:meeting\s+)?title\s*:?\s*\n/i,
  ],
};

const sectionOrder = ['title', 'summary', 'keyDiscussionPoints', 'actionItems', 'followUpEmail'];

const createFallbackTitle = sections => {
  if (sections.title) {
    return sections.title;
  }

  const source =
    sections.summary ||
    sections.keyDiscussionPoints ||
    sections.actionItems ||
    sections.followUpEmail ||
    'Meeting Analysis';
  const firstLine = source.replace(/[#*_`>-]/g, '').split('\n').find(line => line.trim());
  const title = firstLine ? firstLine.trim() : 'Meeting Analysis';

  return title.length > 52 ? `${title.slice(0, 49).trim()}...` : title;
};

const getSectionValue = (analysis, key) => {
  if (!analysis || typeof analysis !== 'object') {
    return '';
  }

  const value = analysis[key];

  if (Array.isArray(value)) {
    return value.map(item => `- ${item}`).join('\n');
  }

  return typeof value === 'string' ? value.trim() : '';
};

const findSectionMatches = text => {
  const matches = [];

  sectionOrder.forEach(key => {
    sectionPatterns[key].forEach(pattern => {
      const match = pattern.exec(text);

      if (match) {
        matches.push({
          key,
          start: match.index,
          contentStart: match.index + match[0].length,
        });
      }
    });
  });

  return matches
    .sort((a, b) => a.start - b.start)
    .filter((match, index, allMatches) => {
      return allMatches.findIndex(item => item.key === match.key) === index;
    });
};

const parseTextAnalysis = text => {
  const sections = { ...emptyAnalysisSections };
  const matches = findSectionMatches(text);

  if (matches.length === 0) {
    sections.summary = text.trim();
    return sections;
  }

  matches.forEach((match, index) => {
    const nextMatch = matches[index + 1];
    const end = nextMatch ? nextMatch.start : text.length;
    sections[match.key] = text.slice(match.contentStart, end).trim();
  });

  return sections;
};

export const normalizeMeetingAnalysis = analysis => {
  if (!analysis) {
    return { ...emptyAnalysisSections };
  }

  if (typeof analysis === 'string') {
    return parseTextAnalysis(analysis);
  }

  return {
    title: getSectionValue(analysis, 'title'),
    summary: getSectionValue(analysis, 'summary'),
    keyDiscussionPoints: getSectionValue(analysis, 'keyDiscussionPoints'),
    actionItems: getSectionValue(analysis, 'actionItems'),
    followUpEmail: getSectionValue(analysis, 'followUpEmail'),
  };
};

export const getMeetingTitle = analysis => {
  return createFallbackTitle(normalizeMeetingAnalysis(analysis));
};

export const formatMeetingAnalysis = analysis => {
  const sections = normalizeMeetingAnalysis(analysis);

  return [
    ['Title', getMeetingTitle(analysis)],
    ['Summary', sections.summary],
    ['Key Discussion Points', sections.keyDiscussionPoints],
    ['Action Items', sections.actionItems],
    ['Follow-up Email', sections.followUpEmail],
  ]
    .filter(([, content]) => content)
    .map(([title, content]) => `## ${title}\n${content}`)
    .join('\n\n');
};

export const getMeetingPreview = analysis => {
  const sections = normalizeMeetingAnalysis(analysis);
  return (
    sections.summary ||
    sections.keyDiscussionPoints ||
    sections.actionItems ||
    sections.followUpEmail ||
    'Meeting analysis'
  );
};
