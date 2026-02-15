<template>
    <div class="container">
        <ul class="progressbar">
            <li v-for="option in options" :key="option" 
                :class="{ active: option === value }" 
                @click="value = option"
            >
                {{ option }}
            </li>
        </ul>
        <div v-for="option in activeOptions" :key="option+'-container'">
            <slot :name="option" />
        </div>
    </div>
</template>

<script>
export default {
    name: 'ComponentTab',
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

.container {
    width:100%;
}
.progressbar {
    counter-reset: step;
    display: flex;
    width: 100%;
    padding: 0;
    margin: calc(15vh - 20px) 0 calc(15vh - 40px) 0;
}
.progressbar li{
    list-style-type: none;
    position:relative;
    text-align: center;
    font-weight: 600;
    flex: 1;
    cursor: pointer;
}
.progressbar li:before {
    content:counter(step);
    counter-increment: step;
    height:30px;
    width:30px;
    line-height: 30px;
    border: 2px solid #ddd;
    display:block;
    text-align: center;
    margin: 0 auto 10px auto;
    border-radius: 50%;
    background-color: white;
}
.progressbar li:after {
    content:'';
    position: absolute;
    width:100%;
    height:2px;
    background-color: #ddd;
    top: 15px;
    left: -50%;
    z-index: -1;
}
.progressbar li:first-child:after {
    content:none;
}
.progressbar li.active {
    color:#27ae60;
}
.progressbar li.active:before {
    border-color:#27ae60;
}
.progressbar li.active + li:after{
    background-color:#27ae60;
}
</style>
