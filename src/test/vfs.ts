// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// Defines a Mocha test suite to group tests of similar kind together
suite("vfs", () => {

	// Defines a Mocha unit test
	test("default test", () => {
		assert.equal(-1, [1, 2, 3].indexOf(5));
		assert.equal(-1, [1, 2, 3].indexOf(0));
	});
});