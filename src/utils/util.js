
export function formatByte(b) {
  var kb = b / 1024;
  if (kb >= 1024) {
      var m = kb / 1024;
      if (m >= 1024) {
          var g = m / 1024;
          return g.toFixed(2) + 'G';
      } else {
          return m.toFixed(2) + 'M';
      }
  } else {
      return kb.toFixed(2) + 'K';
  }
}