import IdleJs from '../../src/Idle';

describe('IdleJs', () => {
  describe('Greet function', () => {
    beforeEach(() => {
      spy(IdleJs, 'greet');
      IdleJs.greet();
    });

    it('should have been run once', () => {
      expect(IdleJs.greet).to.have.been.calledOnce;
    });

    it('should have always returned hello', () => {
      expect(IdleJs.greet).to.have.always.returned('hello');
    });
  });
});
