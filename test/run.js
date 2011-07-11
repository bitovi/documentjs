// load('steal/compress/test/run.js')
/**
 * Tests compressing a very basic page and one that is using steal
 */
load('steal/rhino/steal.js')
steal('//steal/test/test', function( s ) {
	STEALPRINT = false;
	s.test.module("documentjs")
	
	s.test.test("script cleaning", function(){
		
		//lets see if we can clear everything
		s.test.clear();
	
		load('steal/rhino/steal.js')
		
		steal.plugins("documentjs").then(function(){
			var lines = [" ","    Justin","  Brian  "],
				space = DocumentJS.Script.minSpace(lines),
				removed = DocumentJS.Script.removeIndent(lines.slice(0));
			
			s.test.equals(space, 2, "Basic source not right number")
			
			s.test.equals(removed[0], "", "short truncated")
			s.test.equals(removed[1], "  Justin", "Justin is wrong")
			s.test.equals(removed[2], "Brian  ", "Brian is Wrong")
		});
		
		s.test.clear();
		
	})
	


});