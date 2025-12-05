*aruisdante* answer to question poised at reddit thread:

*https://www.reddit.com/r/cpp/comments/18186it/i_am_absolutely_confused_on_the_topic_of/*

# references vs pointers

## Pointer’s Semantics
A pointer is a distinct value type. It has a defined size on a given platform, which can be obtained by sizeof(void*). On a platform with a true 64 bit address space, this will return 8. All pointers to any object type will have this same size: sizeof(T*) == sizeof(U*). The value of a pointer is an actual, real memory location. You can introspect this directly; if you print a pointer without dereferencing it, the value printed is the memory address value the pointer holds.

Basically, pointers are “true” value types in an of themselves and can exist independently of having an object to point to. This is why you can have a null pointer. And since they are true value types, they have their own definition of the following operations, independent of the type they point to:

To compare a pointer means to compare the memory address, not the content at that memory address.

To copy/assign a pointer means to copy/assign the memory address, not the content at that memory address.

Taking the address of a pointer will produce the address of the pointer object itself, not the pointed to content.

“Dereferencing” a pointer produces a reference to the pointed to content. I know, it’s confusing. It made more sense in C when there wasn’t a distinct thing called a reference, so pointers were said to have “reference semantics” and thus “dereferencing” them produced the actual content.

When we say a type is “pointer like,” we mean it models the properties above. This is why the smart pointers behave the way they do. It’s also why std::span is so confusing. std::span looks like a container, so you expect it to behave the way a reference to a container would: comparing it would compare the elements in the span. But you can reassign spans, and that assignment doesn’t reassign the underlying elements, it just reassigns the underlying pointer to point to new elements. So to be consistent, the standard chose the lesser of two evils and made span model a pointer, and thus has pointer semantics all around. When you compare a span, you’re asking “do these spans provide a view onto literally the same content in memory,” just like comparing a pointer. In C++20 they formalized this “container reference API but pointer semantics” notion with the view concept.

## Reference’s Semantics
A reference is not actually a distinct type, just like that the second quote states: there is no actual object that “represents” a reference. You cannot take the address of the reference itself. If you do sizeof(T&), you will get the same answer as sizeof(T). So most accurately, a reference is an alias for the actual instance of an object.

Because references are not true value types in and of themselves, but instead are aliases for the instance, they have the following semantics:

They must be “bound” to an instance at initialization. A reference can never be “null.”

They cannot be re-assigned. Assigning to a reference after it has been “bound” to an instance is equivalent to assigning to the bound instance, not the reference.

Comparing references is equivalent to comparing the referenced instances.

Taking the address of a reference gives the address of the bound instance.

## Implementations
As discussed above, a pointer is an explicitly defined value type. They take up memory on the stack/heap.

A reference, on the other hand, is not an explicitly defined value type. Because a reference isn’t a “real” value type, but instead defined as an alias to the bound instance, the compiler is free to implement references however it wants, as long as it maintains the semantics.

This means a compiler is free to optimize out a reference completely. The compiler cannot inherently do this with a pointer: a pointer has to actually exist because you can take its address, reassign it, etc. However, the compiler is just as free to implement a reference as a pointer (in the machine sense, see below), and often will do so if the reference passes between functions that cannot be inlined.

Why is this so confusing?
Two reasons:

### Conflating Pointer with Indirect Referencing
When people talk about pointers, they often use them interchangeably with the machine’s notion of a memory address and indirect referencing, because that’s what a (raw) pointer models. But these are actually two distinct things. Pointer the C/C++ type is an abstract notion of a memory address that can be used for indirect referencing. It has meaning independent from how a particular platform implements indirect referencing; there is no “pointer” type in assembly, just instructions that perform operations indirected through a memory address. So when folks say “a reference and a pointer are the same thing” they are thinking in terms of this generated machine assembly for indirect referencing, and how the generated assembly might store the addresses used for it.

### The “Reference Semantics” Colloquialism
There is a common colloquialism to refer both pointers and references as having “reference semantics.” What people mean when they say this is that a given variable name is indirectly representing an instance, without being a value type of that instance. It allows manipulation of the instance through the variable name, and passing the instance between functions without having to copy it. However this colloquialism is a misnomer. A pointer does not, in fact, have reference semantics. It is a value type. It is that value type which models reference semantics, through the * and -> operators.

You’ll often hear this pointed out by folks when they ask “does Python/Java have reference semantics or value semantics?” It’s a trick question: the correct answer is “they have value semantics, but the only value type you can directly assign to a name is a pointer.” That said, the lack of a true reference, or an assignable value type other than a pointer, is key to understanding why Java and Python behave the way they do.

## Brining it home
So back to the original quotes. I hope after reading this you can see why neither quote is actually wrong, nor do they contradict each other. They’re just speaking from different perspectives. Bjarne is focused on what he was trying to accomplish when he added references to C++, which C lacked. He wanted something that had the indirect reference properties of a pointer, but with better properties for the common usage of pointers in most C programs, which was to alias a single object: references have a nicer syntax for this case (no need for * and ->), and lack the possibility of edge cases like null pointer dereferences or accidental reassignment of the pointer rather than the pointed to object if you forgot to dereference the pointer first. This latter problem was particularly important to avoid in a language that allows implicit conversion between integral types and pointers: writing some_int_ptr = some_int when you meant to write *some_int_ptr = some_int, or some_int = some_int_ptr when you meant some_int = *some_int_ptr, was a shockingly common source of bugs in C. But he didn’t want to have to invent entirely new ways of doing things: remember the original C++ was just a code generator for C. So he had the clever idea to create “a pointer, but with restrictions.”

The second quote, on the other hand, is more accurately describing what the language actually defines a reference as. Bjarne’s mental model when he was designing references may have been “a pointer with restrictions,” but what he codified was just the indirect reference properties, not actually anything to do with the actual type pointer.