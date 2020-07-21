/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { IFluidObject, IComponentHandle, IComponentLoadable } from "@fluidframework/component-core-interfaces";
import { AsSerializable, Serializable } from "@fluidframework/component-runtime-definitions";
import { NamedComponentRegistryEntries } from "@fluidframework/runtime-definitions";
import { ReactViewAdapter } from "@fluidframework/view-adapters";
import { fluidExport as cmfe } from "@fluid-example/codemirror/dist/codemirror";
import { CollaborativeText } from "@fluid-example/collaborative-textarea";
import { Coordinate, CoordinateInstantiationFactory } from "@fluid-example/multiview-coordinate-model";
import { SliderCoordinateView } from "@fluid-example/multiview-slider-coordinate-view";
import { fluidExport as pmfe } from "@fluid-example/prosemirror/dist/prosemirror";
import { ClickerInstantiationFactory } from "@fluid-example/clicker";

import * as React from "react";
import { Layout } from "react-grid-layout";

export type ICreateAndAttachComponentFunction =
    <T extends IFluidObject & IComponentLoadable>(pkg: string, props?: any) => Promise<T>;

interface ISingleHandleItem {
    handle: IComponentHandle;
}

const createSingleHandleItem = (type: string) => {
    return async (createAndAttachComponent: ICreateAndAttachComponentFunction): Promise<ISingleHandleItem> => {
        const component = await createAndAttachComponent(type);
        return {
            handle: component.handle,
        };
    };
};

const getAdaptedViewForSingleHandleItem = async (serializableObject: ISingleHandleItem) => {
    const handle = serializableObject.handle;
    const component = await handle.get();
    return React.createElement(ReactViewAdapter, { view: component });
};

const getSliderCoordinateView = async (serializableObject: ISingleHandleItem) => {
    const handle = serializableObject.handle as IComponentHandle<Coordinate>;
    const model = await handle.get();
    return React.createElement(SliderCoordinateView, { label: "Coordinate", model });
};

/**
 * A registry entry, with extra metadata.
 */
export interface ISpacesItemEntry<T extends Serializable = AsSerializable<any>> {
    // Would be better if items to bring their own subregistries, and their own ability to create components
    // This might be done by integrating these items with the Spaces subcomponent registry?
    create: (createAndAttachComponent: ICreateAndAttachComponentFunction) => Promise<T>;
    getView: (serializableObject: T) => Promise<JSX.Element>;
    friendlyName: string;
    fabricIconName: string;
}

const clickerItemEntry: ISpacesItemEntry<AsSerializable<ISingleHandleItem>> = {
    create: createSingleHandleItem(ClickerInstantiationFactory.type),
    getView: getAdaptedViewForSingleHandleItem,
    friendlyName: "Clicker",
    fabricIconName: "Touch",
};

const codemirrorItemEntry: ISpacesItemEntry<AsSerializable<ISingleHandleItem>> = {
    create: createSingleHandleItem(cmfe.type),
    getView: getAdaptedViewForSingleHandleItem,
    friendlyName: "Code",
    fabricIconName: "Code",
};

const textboxItemEntry: ISpacesItemEntry<AsSerializable<ISingleHandleItem>> = {
    create: createSingleHandleItem(CollaborativeText.ComponentName),
    getView: getAdaptedViewForSingleHandleItem,
    friendlyName: "Text Box",
    fabricIconName: "Edit",
};

const prosemirrorItemEntry: ISpacesItemEntry<AsSerializable<ISingleHandleItem>> = {
    create: createSingleHandleItem(pmfe.type),
    getView: getAdaptedViewForSingleHandleItem,
    friendlyName: "Rich Text",
    fabricIconName: "FabricTextHighlight",
};

const sliderCoordinateItemEntry: ISpacesItemEntry<AsSerializable<ISingleHandleItem>> = {
    create: createSingleHandleItem(CoordinateInstantiationFactory.type),
    getView: getSliderCoordinateView,
    friendlyName: "Coordinate",
    fabricIconName: "NumberSymbol",
};

export const spacesItemMap = new Map<string, ISpacesItemEntry>([
    ["clicker", clickerItemEntry],
    ["codemirror", codemirrorItemEntry],
    ["textbox", textboxItemEntry],
    ["prosemirror", prosemirrorItemEntry],
    ["slider-coordinate", sliderCoordinateItemEntry],
]);

// This can go away if the item entries have a way to bring their own subregistries.
export const spacesRegistryEntries: NamedComponentRegistryEntries = new Map([
    ClickerInstantiationFactory.registryEntry,
    [cmfe.type, Promise.resolve(cmfe)],
    [CollaborativeText.ComponentName, Promise.resolve(CollaborativeText.getFactory())],
    [pmfe.type, Promise.resolve(pmfe)],
    CoordinateInstantiationFactory.registryEntry,
]);

interface ITemplate {
    [type: string]: Layout[];
}

interface ITemplateDictionary {
    [templateName: string]: ITemplate;
}

export const templateDefinitions: ITemplateDictionary = {
    ["Collaborative Coding"]: {
        ["codemirror"]: [{ x: 0, y: 0, w: 26, h: 6 }],
        ["textbox"]: [{ x: 26, y: 0, w: 10, h: 6 }],
    },
    ["Classroom"]: {
        ["textbox"]: [{ x: 26, y: 0, w: 10, h: 6 }],
        ["prosemirror"]: [{ x: 0, y: 0, w: 26, h: 6 }],
    },
};