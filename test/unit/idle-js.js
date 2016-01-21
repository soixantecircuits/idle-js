import idleJs from '../../src/idle-js';

describe('idleJs', () => {
  describe('Greet function', () => {
    beforeEach(() => {
      spy(idleJs, 'greet');
      idleJs.greet();
    });

    it('should have been run once', () => {
      expect(idleJs.greet).to.have.been.calledOnce;
    });

    it('should have always returned hello', () => {
      expect(idleJs.greet).to.have.always.returned('hello');
    });
  });
});
