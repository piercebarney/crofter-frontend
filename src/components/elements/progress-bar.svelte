<script lang="ts">

    export let stage: number
    export let total: number

    let element: HTMLDivElement

    $: if (stage > total) stage = total
    $: if (element) element.style.width = `${Math.round(((stage + (total * 0.05)) / (total * 1.05)) * 100)}%`

</script>



<div class="wrapper">
    <div bind:this={element}></div>
</div>



<style lang="sass">

    .wrapper
        width: 100%
        height: .5rem
        background-color: #F6FAF6
        border-radius: .25rem

        > div
            height: 100%
            width: 0%
            border-radius: .25rem
            background-color: #468047
            transition: width 1s

</style>