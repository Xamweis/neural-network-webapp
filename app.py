from flask import Flask, request, jsonify, render_template
import numpy as np
import tensorflow as tf

app = Flask(__name__)

# prepare NN and test data
# options: model_stupid, model_genius, model_trained, model       
model = tf.keras.models.load_model("models/model_stupid")                         ###
# model_t = tf.keras.models.load_model("models/model_trained")   ### 

(X_train, Y_train), (X_test, Y_test) = tf.keras.datasets.mnist.load_data()
X_train = X_train.reshape(-1, 784,)
X_test = X_test.reshape(-1, 784,)
X_train = X_train / 255
X_test = X_test / 255

loss = model.evaluate(X_test, Y_test) 
# loss_t = model_t.evaluate(X_test, Y_test)   ###

# if loss[0] > loss_t[0]:                     ###
#     model = model_t                         ###
#     model_t.save("models/model")            ###

# declare list, to fill with user training data
t_x = np.array([], ndmin=2)
t_y = np.array([], ndmin=1)

@app.route("/", methods=["GET", "POST"])
def index():
    global t_x
    global t_y
    global model
    global loss  

    if request.method == "POST":
        req = request.json[0]
        # request is training
        if req in ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']:   
            req = np.uint8(req)
            y = np.array(req, ndmin=1)                             

            img = request.json[1]
            img = np.array(img, dtype=np.float32)
            x = img.reshape(-1, 784,)

            # give every user input weight of 5 compared to mnist data
            x = np.concatenate(([x for _ in range(5)]))
            y = np.concatenate(([y for _ in range(5)]))

            # create new training set or append on existing
            if len(t_y) == 0: 
                t_x = x
                t_y = y
            else: 
                t_x = np.concatenate((t_x, x))
                t_y = np.concatenate((t_y, y))
                model = tf.keras.models.load_model("models/model_trained")

            # training the (trained) model with -n- random samples 
            # AND the user samples since site refresh
            n = 30
            samp_len = len(X_train)
            pick = samp_len - n
            inp, outp = double_shuffle(X_train, Y_train)
            inp = np.array(inp)
            outp = np.array(outp)
            inp = np.concatenate((inp, t_x))                 # reshaping / dimensions!
            outp = np.concatenate((outp, t_y))

            model.fit(inp[pick:], outp[pick:], epochs=3)
            model.save("models/model_trained")
            return jsonify("You trained the model !!!")

        # request is evaluation
        elif request.json == "EVAL":
            if len(t_y) == 0:
                eval = "-"
            else:
                model_t = tf.keras.models.load_model("models/model_trained")
                eval = model_t.evaluate(X_test, Y_test)
            return jsonify(loss[0], eval[0])

        # request is prediction
        else:  
            img = request.json
            img = np.array(img, dtype=np.float32)
            img = img.reshape(-1, 784,)

            preds = model.predict([[img]])                 # predict only takes lists

            predictions = []
            for pred in preds[0]:
                predictions.append(float(pred))
        
            return jsonify(predictions)  

    else:
        # reset model and user training data
        t_x = np.array([], ndmin=2)
        t_y = np.array([], ndmin=1)
        model = tf.keras.models.load_model("models/model_stupid")
        return render_template("index.html")


# unison shuffle inputs and outputs
def double_shuffle(a, b):
    p = np.random.permutation(len(a))
    return a[p], b[p]