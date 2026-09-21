/* Rotation is site configuration, never a student-facing choice. No default is inferred. */
window.RuchiRotation = {
  weekFor(date, rule) {
    if (!rule) return null;
    if (rule.type === 'continuous' && /^\d{4}-\d{2}-\d{2}$/.test(rule.week1Start || '')) {
      const [y,m,d] = rule.week1Start.split('-').map(Number);
      const start = Date.UTC(y,m-1,d);
      const current = Date.UTC(date.getFullYear(),date.getMonth(),date.getDate());
      return ((Math.floor((current-start)/604800000)%4)+4)%4+1;
    }
    if (rule.type === 'month-blocks') {
      const week=Math.ceil(date.getDate()/7);
      return week<=4?week:([1,2,3,4].includes(rule.fifthWeek)?rule.fifthWeek:null);
    }
    return null;
  }
};
