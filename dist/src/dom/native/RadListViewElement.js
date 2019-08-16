import { ListViewViewType, RadListView } from 'nativescript-ui-listview';
import Application from '../../..';
import GlimmerResolverDelegate from '../../glimmer/context';
import { createElement } from '../element-registry';
import NativeElementNode from './NativeElementNode';
export default class RadListViewElement extends NativeElementNode {
    constructor() {
        super('radlistview', RadListView, null);
        let nativeView = this.nativeView;
        nativeView.itemViewLoader = (viewType) => this.loadView(viewType);
        this.nativeView.on(RadListView.itemLoadingEvent, (args) => {
            this.updateListItem(args);
        });
    }
    loadView(viewType) {
        if (viewType === ListViewViewType.ItemView) {
            console.log('creating view for ', viewType);
            let wrapper = createElement('StackLayout');
            const component = GlimmerResolverDelegate.lookupComponent(this.template);
            const compiled = component.compilable.compile(Application.context);
            let componentInstance = Application._renderComponent(this.template, wrapper, null, compiled);
            let nativeEl = wrapper.nativeView;
            nativeEl.__GlimmerComponent__ = componentInstance._meta.component;
            return nativeEl;
        }
    }
    updateListItem(args) {
        let item;
        let listView = this.nativeView;
        let items = listView.items;
        if (args.index >= items.length) {
            console.log("Got request for item at index that didn't exists", items, args.index);
            return;
        }
        if (items.getItem) {
            item = items.getItem(args.index);
        }
        else {
            item = items[args.index];
        }
        if (args.view && args.view.__GlimmerComponent__) {
            let componentInstance = args.view.__GlimmerComponent__;
            let state = componentInstance.state;
            // Update the state with the new item
            state.update(item);
            // and now tell glimmer to re-render
            componentInstance.runtime.env.begin();
            componentInstance.result.rerender();
            componentInstance.runtime.env.commit();
        }
        else {
            console.log('got invalid update call with', args.index, args.view);
        }
    }
}
