import * as Path from 'path'
import * as FS from 'fs-extra'
import {Component} from 'typedoc/dist/lib/utils/component'
import {ConverterComponent} from 'typedoc/dist/lib/converter/components'
import {Converter} from 'typedoc/dist/lib/converter/converter'
import {Context} from 'typedoc/dist/lib/converter/context'
import {SourceReference} from 'typedoc/dist/lib/models/sources/file'
import {Options} from 'typedoc/dist/lib/utils/options/options'


@Component({name: 'mediaplayer'})
export class MediaPlayerPlugin extends ConverterComponent {
    static PATTERN = '<mediaplayer:\s?(.*)>';

    private re: RegExp;

    public initialize(): void {
        this.re = new RegExp(MediaPlayerPlugin.PATTERN, 'igm');

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
                // <video controls="" autoplay="" name="media"><source src="https://dl.dropboxusercontent.com/s/d3e821scn5fppq6/tslocationmanager_ooooiii3_full_vol.wav?dl=0" type="audio/x-wav"></video>

                let replacement = [
                '<video controls name="media" height="50" width="200">',
                    '<source src="$1">',
                '</audio>'
                ].join('');

                if (this.re.test(reflection.comment.shortText)) {
                    reflection.comment.shortText = reflection.comment.shortText.replace(this.re, replacement);
                }
                if (this.re.test(reflection.comment.text)) {
                    reflection.comment.text = reflection.comment.text.replace(this.re, replacement);
                }
                if (reflection.comment.tags) {
                    reflection.comment.tags.forEach(tag => {
                        if (this.re.test(tag.text)) {
                            tag.text = tag.text.replace(this.re, replacement);
                        }
                    });
                }
            }
        }
    }
}