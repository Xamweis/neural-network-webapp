# **DOODLE NUMBERZ**
#### **Video Demo**:  
<https://youtu.be/jVBaQSjgU5c>
#
#### **Description**:
##
- website that lets you draw a number in a field
  - neural network (python) guessing the number after every stroke
  - show all possibilities for 0-9
- ability to train the AI
  - by clicking correct answer (no matter if guess was right or wrong)
  - app.py can be changed to always start with the better of initial/trained model (`###` comments)
- ability to compare initial model with trained one
  - show loss functions by clicking eval button
  - initial model depends on app.py > stupid, genius, trained
#
#### **Design choices**:
In the 'shipped' version i decided to always load the most stupid model (initialized with random parameters).

Like the heading 'AI TRAINER 3000' suggests, you are now able to train a model that has never seen numbers, to a model that recognizes them after a few trainings.

I am aware that one can always click the training buttons, no matter if they are wrong, or there isn't even a number drawn. But if a user decides to do this, he/she will just have a more stupid model and would be responsible for it.
##### (i tried out different settings to really get the feeling that bad training results in a bad network, even though 'good data' from mnist gets included in every train - depends on <b>weight of user-inputs, sample size of mnist, number of training epochs</b>)
<br>

The training always takes all weighted user samples since site refresh and `n` random samples from the mnist data set. Although i am aware that shuffling mnist data set on every train takes much time, this is the result of experimenting with different training sets and i think the current version gives a good sense of training with small sample sizes for the user.

I kept the styling (CSS) simple and am also aware that the site might not be scalable but my focus was on the following lessons:
- sending data from frontend to backend and reverse
- single site application (no reloading / subsites)
- using, training, evaluating neural network
- making the site robust (i.e. handling inputs, while training)

#
#### **Parameters**:
- initial model
- user input weight
- mnist size on training
- training epochs

#
#### **Files**:
> app.py
- flask app

> model_init.ipynb
- model built and config

> /models
- model saves

> /static & /templates
- JavaScript, CSS, icon, html
#
#### **Toolset**:
- python
  - numpy
  - flask
  - tensorflow keras
  - jupyter notebook
- JavaScript
  - asynchronous, fetch API
  - JSON
- HTML
  - templating (JINJA)
- CSS
