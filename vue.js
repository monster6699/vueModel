class Vue {
    constructor(obj_instance) {
        this.$data = obj_instance.data
        Observer(this.$data)
        Compile(obj_instance.el, this)
    }
}


class Denpendcy {
    // temp = null;
    constructor() {
        this.subscribers = []
    }

    addSub(sub) {
        this.subscribers.push(sub)
    }

    notify() {
        this.subscribers.forEach(sub => sub.update())
    }
}

Denpendcy.temp = undefined


class Watcher {
    constructor(vm, key, callback) {
        this.vm = vm;
        this.key = key;
        this.callback = callback;
        Denpendcy.temp = this;
        key.split(".").reduce((total, current) => total[current], vm.$data);
    }
    update() {
        const value = this.key.split(".").reduce((total, current) => total[current], this.vm.$data);
        this.callback(value)
    }
}

function Observer(data_instance) {
    if(!data_instance || typeof data_instance !== 'object') return;
    let denpendcy  = new Denpendcy()
    Object.keys(data_instance).forEach(key => {
        let value = data_instance[key]
        Observer(value)
        Object.defineProperty(data_instance, key, {
            enumerable: true,
            configurable: true,
            get() {
                console.log(`访问了属性${key},值为：${value}`)
                Denpendcy.temp && denpendcy.addSub(Denpendcy.temp)
                return value;
            },
            set(newValue) {
                console.log(`为属性${key}设置值为${newValue}`);
                value = newValue
                denpendcy.notify()
                Observer(value)
            }
        })
    });
}

function Compile(el, vm) {
    vm.$el = document.querySelector(el);
    const fragment = document.createDocumentFragment();
    let child;
    while(child = vm.$el.firstChild) {
        fragment.append(child)
    }
    fragement_compile(fragment)
    function fragement_compile(node) {
        let nodeValue = node.nodeValue;
        if(node.nodeType === 3) {
            let partten = /\{\{\s*(\S+)\s*\}\}/
            const res_reg = partten.exec(node.nodeValue)
            if(res_reg){
                const value = res_reg[1].split(".").reduce((total, current) => total[current], vm.$data)
                node.nodeValue = nodeValue.replace(partten, value);
                new Watcher(vm, res_reg[1], newValue => {
                    node.nodeValue = nodeValue.replace(partten, newValue);
                })
                // console.log(Denpendcy);
            }
            return
        }
        node.childNodes.forEach(child => {
            fragement_compile(child)
        });
    }
    vm.$el.appendChild(fragment)
}





