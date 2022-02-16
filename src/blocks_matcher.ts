import {Optional} from './utils';
import {Comment} from '@babel/types';

export enum BlockType {
    if, elif, else
}

export class Block {
    public type: BlockType;
    /**
     * Block start location as marked by a javascript comment
     */
    public start: Comment;
    /**
     * Block end location as marked by a javascript comment, undefined if block is open
     */
    public end?: Comment;
    /**
     * Block code is considered "active" and won't be removed
     */
    public active: boolean;
    /**
     * Nested blocks
     */
    public children: Block[];
    /**
     * In a block group of multiple else(ifs), mark if this block group was previously active.
     *
     * This is a logical AND of all `Block.active` of the if/else/elif group.
     */
    public group_is_active: boolean;
    public parent: Optional<Block>;

    constructor(type: BlockType, start: Comment, is_active: boolean, group_is_active: boolean) {
        this.type = type;
        this.start = start;
        this.active = is_active;
        this.group_is_active = group_is_active;
        this.children = [];
    }

    public setParent(parent: Block) {
        this.parent = parent;
    }

    public addChild(child: Block) {
        child.setParent(this);
        this.children.push(child);
    }

    findOpenBlock(): Optional<Block> {
        // If this block is closed, all its children are closed
        if (this.closed) {
            return undefined;
        }
        // If no children, this is an open block
        if (this.children.length === 0) {
            return this;
        }
        const last_child = this.children[this.children.length - 1];
        // If the last child is closed, all previous children are also closed
        if (last_child.closed) {
            return this;
        }
        return last_child.findOpenBlock();
    }

    close(comment: Comment) {
        this.end = comment;
    }

    public get closed() {
        return typeof this.end !== 'undefined';
    }
}

export class BlocksMatcher {
    private readonly _blocks: Block[];

    constructor() {
        this._blocks = [];
    }

    public get last_block(): Optional<Block> {
        if (this._blocks.length === 0) {
            return undefined;
        }
        return this._blocks[this._blocks.length - 1];
    }

    public get closed(): boolean {
        if (this._blocks.length === 0) {
            return true;
        }
        return this._blocks[this._blocks.length - 1].closed;
    }

    public get current_block(): Optional<Block> {
        if (this._blocks.length === 0) {
            return undefined;
        }
        return this._blocks[this._blocks.length - 1].findOpenBlock();
    }

    public add(type: BlockType, comment: Comment, block_active: boolean, group_is_active: boolean) {
        const current_block = this.current_block;
        if (current_block) {
            current_block.addChild(new Block(type, comment, block_active, group_is_active));
        } else {
            this._blocks.push(new Block(type, comment, block_active, group_is_active));
        }
    }

    public add_if(comment: Comment, is_active: boolean) {
        this.add(BlockType.if, comment, is_active, is_active);
    }

    public add_else_if(comment: Comment, is_active: boolean) {
        let current_block = this.current_block;
        if (!current_block) {
            throw new Error('else if block has no matching if block');
        }
        if (current_block.type === BlockType.else) {
            throw new Error('else if block cannot follow else block');
        }
        current_block.end = comment;
        if (current_block.group_is_active) {
            is_active = false;
        }
        this.add(BlockType.elif, comment, is_active, current_block.group_is_active || is_active);
    }

    public add_else(comment: Comment) {
        let current_block = this.current_block;
        if (!current_block) {
            throw new Error('else block has no matching if block');
        }
        if (current_block.type === BlockType.else) {
            throw new Error('else block cannot follow else block');
        }
        current_block.end = comment;
        this.add(BlockType.else, comment, !current_block.group_is_active, true);
    }

    public close(comment: Comment) {
        if (this._blocks.length === 0) {
            throw new Error('no blocks available to close');
        }
        if (this.closed) {
            throw new Error('all blocks already closed');
        }
        // Current block should always be a Block since we just checked if all blocks are closed
        (this.current_block as Block).close(comment);
    }

    private* getInactiveBlocks(blocks: Block[]): Generator<Block> {
        for (const block of blocks) {
            if (!block.active) {
                yield block;
            } else {
                if (block.children.length > 0) {
                    yield* this.getInactiveBlocks(block.children);
                }
            }
        }
    }

    public get inactive_blocks(): Generator<Block> {
        return this.getInactiveBlocks(this._blocks);
    }
}