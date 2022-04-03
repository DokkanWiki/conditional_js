<style>
    h1 {
        font-size: 5em;
    }
</style>

<template>
    <div>
        <h1>{{ title }}</h1>
        <ul>
            <li v-for="item in list">{{ item }}</li>
        </ul>
    </div>
</template>

<script>
    export default {
        data: () => ({
            title: 'My First Vue Application',
            list: [
                'Item 1',
                'Item 2',
                'Item 3',
                'Item 4',
                'Item 5',
            ]
        }),
        mounted() {
            // @ifdef TEST
            throw Error();
            // @endif
        }
    }
</script>
