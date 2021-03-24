import * as ts from 'typescript';
import * as Path from 'path'
import * as FS from 'fs-extra'
import { Component, ConverterComponent } from 'typedoc/dist/lib/converter/components';
import {Converter} from 'typedoc/dist/lib/converter/converter'
import {Context} from 'typedoc/dist/lib/converter/context'
import {SourceReference} from 'typedoc/dist/lib/models/sources/file'
import {Options} from 'typedoc/dist/lib/utils/options/options'

@Component({name: 'mediaplayer'})
export class MediaPlayerPlugin extends ConverterComponent {

    static PATTERN = /<mediaplayer:\s?((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)>/gim

    public initialize() {
        this.listenTo(this.owner, Converter.EVENT_BEGIN, this.onBegin)
    }

    private onBegin(): void {
        // read options parameter
        const options: Options = this.application.options

        try {
            // register handler
            this.listenTo(this.owner, Converter.EVENT_RESOLVE_END, this.onEndResolve)
        }
        catch ( e ) {
            console.error('typedoc-plugin-mediaplayer: ' + e.message)
        }
    }

    private onEndResolve(context: Context): void {
        const project = context.project

        for ( let key in project.reflections ) {
            const reflection = project.reflections[key];
            if (reflection.comment) {
                let replacement = [
                '<video controls name="media" height="50" width="200">',
                    '<source src="$1">',
                '</audio>'
                ].join('');

                if (MediaPlayerPlugin.PATTERN.test(reflection.comment.shortText)) {
                    reflection.comment.shortText = reflection.comment.shortText.replace(MediaPlayerPlugin.PATTERN, replacement);
                }
                if (MediaPlayerPlugin.PATTERN.test(reflection.comment.text)) {
                    reflection.comment.text = reflection.comment.text.replace(MediaPlayerPlugin.PATTERN, replacement);
                }
                if (reflection.comment.tags) {
                    reflection.comment.tags.forEach(tag => {
                        if (MediaPlayerPlugin.PATTERN.test(tag.text)) {
                            tag.text = tag.text.replace(MediaPlayerPlugin.PATTERN, replacement);
                        }
                    });
                }
            }
        }
    }
}