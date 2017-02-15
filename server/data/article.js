export default (keyword = 'tech') => {
  return {
    title: `test${Date.now()}`,
    summary: 'some summary',
    content: 'good content',
    keywords: ['test', keyword],
  };
};
