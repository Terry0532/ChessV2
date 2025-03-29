import Piece from './piece';

describe('Piece', () => {
  test('should set player and style on initialization', () => {
    const iconUrl = 'icon-url';
    const piece = new Piece(1, iconUrl);
    
    expect(piece.player).toBe(1);
    expect(piece.style.backgroundImage).toBe("url('" + iconUrl + "')");
    expect(piece.style.backgroundColor).toBe("");
  });

  test('setBackgroundColor should update the background color', () => {
    const piece = new Piece(1, 'icon-url');
    piece.setBackgroundColor('red');
    
    expect(piece.style.backgroundColor).toBe('red');
  });
});
