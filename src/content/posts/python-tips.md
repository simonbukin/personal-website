---
date: 2019-11-03
title: 'Python Tips'
slug: 'python-tips'
description: 'A collection of smaller Python tips, including usage of enumerate, swapping, and defaultdict'
published: true
tags: ['python']
---

This post is a compilation of small Python tips I’ve gotten used to using over the years. They’re in no particular order, but feel free to try any that you don’t know about.

## Underscore

In certain situations, you may not want to use a variable provided to you by some expression (this happens commonly with `enumerate` and looping). In this case, just replace the unneeded variable with `_`.

```python
fruits = ['apple', 'orange', 'lemon']

for i, _ in enumerate(fruits): # ignoring the value output for enumerate()
    print(i)
```

This is a relatively basic example, but it’s worth knowing about for some more obscure applications.

## Fast Swapping

Swapping the values of two variables comes up fairly often (especially in sorting algorithms). In most other languages, this swap would look something like this:

```python
a = [1, 2, 3]

tmp = a[0]
a[0] = a[1]
a[1] = tmp
```

Python provides a cleaner way of doing this via unpacking values:

```python
a = [1, 2, 3]

a[0], a[1] = a[1], a[0]
```

Much nicer, isn’t it?

## Initializing A List

Sometimes we need to initialize a list with values. One way to do this is as follows:

```python
l = []

for i in range(10):
l.append(None)
```

This works, but can be done in a cleaner (and more Pythonic) way as follows:

```python
l = [None] \* 10
```

Neat.

## Dictionary Access

The typical way of accessing dict values is `d[key]`. While this works, if the value is not in the dict, you get `None`, which is problematic at times. For example, if you’re iterating through a list stored in a dict:

```python
d = {'fruits': ['Apple', 'Banana']}

for elem in d['vegetables']: # None! You'll be getting a NoneType error here.
print(elem)
```

To avoid this, you can use `.get` to access dict values, which just takes the key you want to access and a default value to return if it is not found.

```python
d = {'fruits': ['Apple', 'Banana']}
for elem in d.get('vegetables', []): # No problemo.
print(elem)
```

By default, `.get` will return `None` if you do not provide a return value.

## Dictionaries with Default Values

If you’ve ever tried to access a key in a dictionary that hadn’t been initialized, you would have been greeted with a very friendly `KeyError`. The usual solution to this was something like this:

```python
d = {'fruits': ['Apple', 'Banana']}

if not d.get('vegetables'): # work with vegetables
else:
d['vegetables'] = []
```

`.get` allows you to check if the key is in the dict. Since `None` is `False`-y, saying not `None` only passes if the key is in the dict.

While this certainly works, sometimes you want to populate a dict as you’re working through a problem. The above syntax gets a bit cumbersome, and thankfully, Python has a solution. Enter `defaultdict`.

```python
from collections import defaultdict

integer_dict = defaultdict(int)

integer_dict[0] += 1 # this works!
```

`defaultdict` allows you to define a dictionary with a type, which then allows you to access dict keys that haven’t been accessed before without needing to initialize them. For special cases, you can also pass in a `lambda`:

```python
from collections import defaultdict

ones_dict = defaultdict(lambda: 1) # int but with different default value

a[0] += 1 # a[0] is now 2!

class Mug:
def **init**(self, beverage = None):
self.beverage = beverage
def set_beverage(self, bev):
self.beverage = bev

drinks = defaultdict(lambda: Mug('soda'))

drinks['jimmy'].set_beverage('water') # keep it healthy jimmy
```

Nifty!
