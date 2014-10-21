@typedef {{}} documentjs.Tag Tag 
An object that describes the behavior of 
a tag.  
@parent documentjs.tags
@hide

@option {function(String):Boolean|RegExp} codeMatch(code) Returns true
if the code matches this tag. 
@option {function(String):DocObject} code(codeLine) Takes
@option {Boolean} [codeScope=false] If `code(codeLine)` returns a DocObject,
set this object as the new scope.