<template>
    <div>
        <ul class="radio">
            <li v-for="option in options" :key="option">
                <input type="radio" :id="option" name="radio-group" @change="value = option" :checked="value === option" />
                <label :for="option">{{ option }}</label>
            </li>
        </ul>
        <div v-for="option in activeOptions" :key="option+'-container'">
            <slot :name="option" />
        </div>
    </div>
</template>

<script>
export default {
    name: 'ComponentTabRadio',
    props: {
        options: Array,
        default: String,
    },
    data() {
        return {
            value: this.default,
        }
    },
    computed: {
        activeOptions() { return this.options.filter(o => o === this.value); },
    },
}
</script>


<style scoped>
[type="radio"]:checked,
[type="radio"]:not(:checked) {
    position: absolute;
    left: -9999px;
}
[type="radio"]:checked + label,
[type="radio"]:not(:checked) + label
{
    position: relative;
    padding-left: 28px;
    cursor: pointer;
    line-height: 20px;
    display: inline-block;
    color: #666;
}
[type="radio"]:checked + label:before,
[type="radio"]:not(:checked) + label:before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 18px;
    height: 18px;
    border: 1px solid #ddd;
    border-radius: 100%;
    background: #fff;
}
[type="radio"]:checked + label:after,
[type="radio"]:not(:checked) + label:after {
    content: '';
    width: 12px;
    height: 12px;
    background: #F87DA9;
    position: absolute;
    top: 4px;
    left: 4px;
    border-radius: 100%;
    -webkit-transition: all 0.2s ease;
    transition: all 0.2s ease;
}
[type="radio"]:not(:checked) + label:after {
    opacity: 0;
    -webkit-transform: scale(0);
    transform: scale(0);
}
[type="radio"]:checked + label:after {
    opacity: 1;
    -webkit-transform: scale(1);
    transform: scale(1);
}

ul.radio {
    display: flex;
    padding: 0;
    margin: 10px 0px;
}

ul.radio > li {
    list-style-type: none;
    margin: 0 50px;
}
</style>
