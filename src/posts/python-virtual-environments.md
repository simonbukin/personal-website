---
date: 2019-10-25
title: 'Python Virtual Environments'
slug: 'python-virtual-environments'
description: 'A blog post covering how to properly set up virtual environments in Python and venv'
published: true
tags: ['python']
---

The basics of virtual environments are essential knowledge for anyone using Python. Unless you want to spend the rest of your life fixing version issues because you ran `pip install <package>` globally, read on!

Virtual environments in Python are used to divide your workspace into subsections and keep your global Python environment clean. This helps with versioning, for example, as different projects may require different versions of packages.

## Options

When it comes to setting up your virtual environments, you’ve got a slew of options that can fit your specific needs. Here are a few:

- [pipenv](https://pipenv.pypa.io/en/latest/)
- [poetry](https://python-poetry.org/)
- [pyenv](https://github.com/pyenv/pyenv)
- [virtualenv](https://virtualenv.pypa.io/en/latest/)

Feel free to experiment with all of them to see which one you like the most. Python also provides a solution in the standard library (`venv`), and it also happens to be the option that I use most frequently, so i’ll be demoing it in this tutorial.

## Basics

Let’s say you’ve just started a project and want to get to install your dependencies. Here’s what that would look like:

```shell
$ mkdir new_shiny_project
$ cd new_shiny_project
$ python3 -m venv env
```

The meat of `venv` comes from the last line. This where the new virtual environment is actually created. Since `venv` is in the standard library, we can access it with the `python3 -m` syntax, since the `-m` option just specified the default library path. `venv` takes a name as an argument, which is what your new and shiny virtual environment will be called. After the last line runs (it may take a few seconds) your project will now contain a virtual environment to use!

## Activating and Deactivating

Now that we have a new environment, don’t start installing packages! We have to activate the environment first. This is done by running:

```shell
$ source env/bin/activate
```

In this case, our virtual environment folder is called `env` out of respect for common convention, but you could name it whatever you would like.

Now that our virtual environment is activated, you can install packages all you want. They are safely contained within the `env` folder, safe from your global package space. The packages installation process is unchanged, so running `pip install <cool_module>` works as you would expect.

But maybe you’ve finished working on your `new_shiny_project`, and want to switch to something else for the day ([like Go](https://go.dev/)). Leaving the virtual environment is as simple as running:

```shell
$ deactivate
```

## Dependencies

Now that you’ve installed all the dependencies you want and are ready to share your project, how will anyone be able to set up their environments the same way you did? Thankfully, `pip` provides a utility just for this. To output your dependencies into a file, simply run:

```shell
$ pip freeze > requirements.txt
```

This will write all the dependencies in your virtual environment to a file called `requirements.txt`. Easy as `.py`.
Git

Your env folder and Git will not get along, so it is best to not commit it to any sort of source control. Make sure to add `env/` to your `.gitignore` to stop it from sneaking into your commits. Instead, commit your `requirements.txt` and reinstall your dependencies by running:

```shell
$ pip install -r requirements.txt
```

## Workflow

Now that you have the basics down, here is a log of the workflow you can expect from using `venv`.

```shell
$ mkdir amazing_project
$ cd amazing_project
$ python3 -m venv env
$ source env/bin/activate
$ (env) pip install requests
...
$ pip freeze > requirements.txt
$ echo "env/" > .gitignore
$ git add -A
$ git commit "initial commit"
$ git push
$ deactivate
```

## Wrapup

That’s really all there is to it! Python virtual environments are made to be easy to use, and are an essential utility for keeping projects isolated and easy to share. Feel free to try out some other options (`pipenv` is one of my other favorites), and let me know how it goes. Now go forth and `venv`!
