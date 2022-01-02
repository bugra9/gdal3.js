<template>
    <div class="grid-list-auto2">
        <div v-for="input in inputs" :key="input.name">
            <label :title="input.description">{{ input.name }} <span class="info-color">🛈</span></label>
            <input v-if="input.type === 'string'" class="input" :title="inputInfo(input)" :value="params.in[input.name]" @input="(event) => li(input.name, event.target.value)" />
            <input v-if="input.type === 'integer' || input.type === 'int' || input.type === 'unsigned int'" class="input" :title="inputInfo(input)" type="number" :value="params.in[input.name]" @input="(event) => li(input.name, event.target.value)" />
            <input v-if="input.type === 'float'" class="input" :title="inputInfo(input)" type="number" :value="params.in[input.name]" @input="(event) => li(input.name, event.target.value)" />
            <MultiSelect v-if="input.type === 'string-select'" :value="params.in[input.name]" @input="(value) => li(input.name, value, input.type)"
                :options="input.options" :title="inputInfo(input)"
                :showLabels="false" placeholder="Select one" :maxHeight="500"
            />
            <MultiSelect v-if="input.type === 'boolean'" :value="params.in[input.name]" @input="(value) => li(input.name, value, input.type)"
                :options="['YES', 'NO']" :title="inputInfo(input)"
                :showLabels="false" placeholder="Select one" :maxHeight="500"
            />
        </div>
    </div>
</template>

<script>
// eslint-disable vue/no-mutating-props
import { split } from '../utils';

export default {
    name: 'ComponentForm',
    props: {
        inputs: Array,
        self: Object,
        prefix: String,
    },
    data() {
        return {
            params: { in: {}, out: [] },
        }
    },
    created() {
        this.init();
    },
    methods: {
        init() {
            const temp = split(this.self.translateOptions);
            for(let i = 0; i < temp.length; i += 1) {
                if (temp[i] === this.prefix) {
                    const [key, value] = temp[i+1].split('=');
                    this.params.in[key] = value;
                    ++i;
                } else {
                    this.params.out.push(temp[i]);
                }
            }
        },
        sss() {
            const output = [...this.params.out];
            for (const [key, value] of Object.entries(this.params.in)) {
                output.push(this.prefix, `"${key}=${value}"`);
            }
            this.self.translateOptions = output.join(' ');
        },
        li(key, value, type) {
            console.log(key, value);
            if (value) this.params.in[key] = value;
            else delete this.params.in[key];
            this.sss();
            if (type === 'string-select' || type === 'boolean') this.$forceUpdate();
        },
        multiLi(key, index, value) {
            const data = (this.params.in[key] || '').split(',');
            data[index] = value;
            this.li(key, data.join(','));
        },
        inputInfo(inputType) {
            let output = `type=${inputType.type}`;
            if (inputType.default) output += `, default=${inputType.default}`;
            if (inputType.min) output += `, min=${inputType.min}`;
            if (inputType.max) output += `, max=${inputType.max}`;
            return output;
        }
    },
}
</script>

<style scoped>
label {
    font-size: 12px;
}
.grid-list-auto2 {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    column-gap: 30px;
    row-gap: 5px;
}
.grid-list-auto2 > *{
    width: 100%;
}
</style>
